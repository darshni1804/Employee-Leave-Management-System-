"""
Leaves service layer.

All leave business logic lives here.  Views must never contain business rules —
delegate everything through this class.

Business rules enforced here:
    Rule 1  — Max 20 approved leave days per calendar year.
    Rule 2  — Cannot apply for past dates (start_date < today).
    Rule 3  — end_date must not be before start_date.
    Rule 4  — Cannot overlap with an existing APPROVED leave.
    Rule 5  — Employee can only cancel PENDING leave.
"""
from __future__ import annotations

import logging
from datetime import date
from typing import TYPE_CHECKING
from django.db import transaction
from django.db.models import Q, Sum

from core.exceptions import ServiceError
from apps.notifications.email_service import EmailService

if TYPE_CHECKING:
    from django.db.models import QuerySet

    from apps.accounts.models import User
    from apps.leaves.models import LeaveBalance, LeaveRequest, LeaveType

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────

MAX_ANNUAL_LEAVE_DAYS: int = 20


class LeavesService:
    """
    Service class encapsulating all leave management business logic.

    Usage::

        service = LeavesService()
        leave = service.submit_leave(employee, validated_data)
    """

    # ──────────────────────────────────────────
    # Public Employee-Facing Methods
    # ──────────────────────────────────────────

    @staticmethod
    def submit_leave(employee: "User", validated_data: dict) -> "LeaveRequest":
        """
        Submit a new leave request on behalf of an employee.

        Enforces Rules 1–4 and persists the request with PENDING status.

        Args:
            employee:       The authenticated employee submitting the leave.
            validated_data: Cleaned data from ``LeaveCreateSerializer``.

        Returns:
            The newly created ``LeaveRequest`` instance.

        Raises:
            ServiceError: On any business-rule violation.
        """
        from apps.leaves.models import LeaveRequest, LeaveStatus

        start_date: date = validated_data["start_date"]
        end_date: date = validated_data["end_date"]

        # Rule 2 — No past dates (serializer also catches this; belt-and-braces)
        if start_date < date.today():
            raise ServiceError(
                "Leave start date cannot be in the past.",
                status_code=400,
            )

        # Rule 3 — Range sanity (serializer also catches this)
        if end_date < start_date:
            raise ServiceError(
                "End date cannot be before start date.",
                status_code=400,
            )

        # Calculate duration
        total_days = LeavesService.calculate_leave_days(start_date, end_date)

        # Rule 1 — Annual limit check
        remaining = LeavesService.remaining_leave(employee, start_date.year)
        if total_days > remaining:
            raise ServiceError(
                f"Insufficient leave balance. You have {remaining} day(s) remaining "
                f"for {start_date.year}. Requested: {total_days} day(s).",
                status_code=400,
            )

        # Rule 4 — Overlap with approved leave
        overlap_exists = LeaveRequest.objects.filter(
            employee=employee,
            status=LeaveStatus.APPROVED,
        ).filter(
            Q(start_date__lte=end_date) & Q(end_date__gte=start_date)
        ).exists()

        if overlap_exists:
            raise ServiceError(
                "Your leave request overlaps with an existing approved leave.",
                status_code=400,
            )

        # Persist
        leave_request = LeaveRequest.objects.create(
            employee=employee,
            start_date=start_date,
            end_date=end_date,
            reason=validated_data.get("reason", ""),
            total_days=total_days,
            status=LeaveStatus.PENDING,
        )

        logger.info(
            "Leave request #%s submitted by employee %s (%s to %s, %s day(s)).",
            leave_request.pk,
            employee.pk,
            start_date,
            end_date,
            total_days,
        )
        transaction.on_commit(
            lambda: EmailService.send_leave_applied_email(leave_request)
        )
        return leave_request

    @staticmethod
    def cancel_leave(request_id: int, employee: "User") -> "LeaveRequest":
        """
        Allow an employee to cancel their own PENDING leave request.

        Rule 5 — Only PENDING leave can be cancelled by the employee.

        Args:
            request_id: Primary key of the ``LeaveRequest`` to cancel.
            employee:   The authenticated employee requesting cancellation.

        Returns:
            The updated ``LeaveRequest`` instance.

        Raises:
            ServiceError: If the request is not found, does not belong to the
                          employee, or is not in PENDING status.
        """
        from apps.leaves.models import LeaveRequest, LeaveStatus

        try:
            leave_request = LeaveRequest.objects.get(pk=request_id, employee=employee)
        except LeaveRequest.DoesNotExist:
            raise ServiceError(
                "Leave request not found.",
                status_code=404,
            )

        if leave_request.status != LeaveStatus.PENDING:
            raise ServiceError(
                f"Only PENDING leave can be cancelled. "
                f"This request is currently '{leave_request.get_status_display()}'.",
                status_code=400,
            )

        leave_request.status = LeaveStatus.CANCELLED
        leave_request.save(update_fields=["status", "updated_at"])

        logger.info(
            "Leave request #%s cancelled by employee %s.",
            leave_request.pk,
            employee.pk,
        )
        transaction.on_commit(
            lambda: EmailService.send_leave_cancelled_email(leave_request)
        )
        return leave_request

    @staticmethod
    def list_employee_leaves(employee: "User") -> "QuerySet[LeaveRequest]":
        """
        Return an optimised queryset of leave requests for a single employee.

        The caller (ViewSet) applies further filtering/pagination on top.

        Args:
            employee: The authenticated employee.

        Returns:
            A queryset of ``LeaveRequest`` objects belonging to the employee,
            ordered by most-recent first.
        """
        from apps.leaves.models import LeaveRequest

        return (
            LeaveRequest.objects.filter(employee=employee)
            .select_related("employee", "reviewed_by")
            .order_by("-created_at")
        )

    # ──────────────────────────────────────────
    # Utility / Calculation Methods
    # ──────────────────────────────────────────

    @staticmethod
    def calculate_leave_days(start_date: date, end_date: date) -> int:
        """
        Return the total inclusive calendar days between two dates.

        Args:
            start_date: First day of leave.
            end_date:   Last day of leave.

        Returns:
            Number of days (inclusive, minimum 1).
        """
        if end_date < start_date:
            return 0
        return (end_date - start_date).days + 1

    @staticmethod
    def remaining_leave(employee: "User", year: int | None = None) -> int:
        """
        Return the number of leave days the employee can still apply for
        in the given calendar year (default: current year).

        Calculation: MAX_ANNUAL_LEAVE_DAYS minus total days of APPROVED leaves
        whose start_date falls within the year.

        Args:
            employee: The employee to calculate for.
            year:     Calendar year to check (defaults to current year).

        Returns:
            Remaining available days (can be 0, never negative).
        """
        from apps.leaves.models import LeaveRequest, LeaveStatus

        if year is None:
            year = date.today().year

        used = (
            LeaveRequest.objects.filter(
                employee=employee,
                status=LeaveStatus.APPROVED,
                start_date__year=year,
            ).aggregate(total=Sum("total_days"))["total"]
            or 0
        )

        remaining = MAX_ANNUAL_LEAVE_DAYS - int(used)
        return max(remaining, 0)

    # ──────────────────────────────────────────
    # Manager-Facing Methods (Phase 4 scope)
    # ──────────────────────────────────────────

    @staticmethod
    def list_all_requests() -> "QuerySet[LeaveRequest]":
        """
        Return queryset of all leave requests in the system for manager review.

        Optimised with select_related for employee and reviewed_by.
        Ordered by most-recent created_at first.
        """
        from apps.leaves.models import LeaveRequest

        return (
            LeaveRequest.objects.all()
            .select_related("employee", "reviewed_by", "leave_type")
            .order_by("-created_at")
        )

    @staticmethod
    def approve_leave(request_id: int, reviewer: "User", comment: str = "") -> "LeaveRequest":
        """
        Approve a pending leave request.

        Rules:
            Only PENDING leave requests can be approved.

        Updates:
            - status = APPROVED
            - reviewed_by = reviewer
            - reviewed_at = current timestamp
            - reviewer_comment = comment (if provided)
        """
        from django.utils import timezone
        from apps.leaves.models import LeaveRequest, LeaveStatus

        try:
            leave_request = LeaveRequest.objects.select_related("employee", "reviewed_by").get(pk=request_id)
        except LeaveRequest.DoesNotExist:
            raise ServiceError(
                "Leave request not found.",
                status_code=404,
            )

        if leave_request.status != LeaveStatus.PENDING:
            raise ServiceError(
                f"Only PENDING leave requests can be approved. "
                f"This request is currently '{leave_request.get_status_display()}'.",
                status_code=400,
            )

        leave_request.status = LeaveStatus.APPROVED
        leave_request.reviewed_by = reviewer
        leave_request.reviewed_at = timezone.now()
        if comment:
            leave_request.reviewer_comment = comment
        leave_request.save(update_fields=["status", "reviewed_by", "reviewed_at", "reviewer_comment", "updated_at"])

        logger.info(
            "Leave request #%s approved by manager %s.",
            leave_request.pk,
            reviewer.pk,
        )
        transaction.on_commit(
            lambda: EmailService.send_leave_approved_email(leave_request, reviewer)
        )
        return leave_request

    @staticmethod
    def reject_leave(request_id: int, reviewer: "User", comment: str = "") -> "LeaveRequest":
        """
        Reject a pending leave request.

        Rules:
            Only PENDING leave requests can be rejected.

        Updates:
            - status = REJECTED
            - reviewed_by = reviewer
            - reviewed_at = current timestamp
            - reviewer_comment = comment (if provided)
        """
        from django.utils import timezone
        from apps.leaves.models import LeaveRequest, LeaveStatus

        try:
            leave_request = LeaveRequest.objects.select_related("employee", "reviewed_by").get(pk=request_id)
        except LeaveRequest.DoesNotExist:
            raise ServiceError(
                "Leave request not found.",
                status_code=404,
            )

        if leave_request.status != LeaveStatus.PENDING:
            raise ServiceError(
                f"Only PENDING leave requests can be rejected. "
                f"This request is currently '{leave_request.get_status_display()}'.",
                status_code=400,
            )

        leave_request.status = LeaveStatus.REJECTED
        leave_request.reviewed_by = reviewer
        leave_request.reviewed_at = timezone.now()
        if comment:
            leave_request.reviewer_comment = comment
        leave_request.save(update_fields=["status", "reviewed_by", "reviewed_at", "reviewer_comment", "updated_at"])

        logger.info(
            "Leave request #%s rejected by manager %s.",
            leave_request.pk,
            reviewer.pk,
        )
        transaction.on_commit(
            lambda: EmailService.send_leave_rejected_email(leave_request, reviewer)
        )
        return leave_request

    @staticmethod
    def manager_statistics() -> dict:
        """
        Compute and return aggregate leave statistics for managers.

        Returns:
            dict containing:
                - total_employees
                - pending_requests
                - approved_today
                - approved_total
                - rejected_total
                - cancelled_total
        """
        from django.utils import timezone
        from apps.accounts.models import User, UserRole
        from apps.leaves.models import LeaveRequest, LeaveStatus

        today = timezone.now().date()

        total_employees = User.objects.filter(is_active=True).count()
        pending_requests = LeaveRequest.objects.filter(status=LeaveStatus.PENDING).count()
        approved_today = LeaveRequest.objects.filter(
            status=LeaveStatus.APPROVED,
            reviewed_at__date=today,
        ).count()
        approved_total = LeaveRequest.objects.filter(status=LeaveStatus.APPROVED).count()
        rejected_total = LeaveRequest.objects.filter(status=LeaveStatus.REJECTED).count()
        cancelled_total = LeaveRequest.objects.filter(status=LeaveStatus.CANCELLED).count()

        return {
            "total_employees": total_employees,
            "pending_requests": pending_requests,
            "approved_today": approved_today,
            "approved_total": approved_total,
            "rejected_total": rejected_total,
            "cancelled_total": cancelled_total,
        }

    # Aliases for backward compatibility
    submit_leave_request = submit_leave
    approve_leave_request = approve_leave
    reject_leave_request = reject_leave
    cancel_leave_request = cancel_leave

