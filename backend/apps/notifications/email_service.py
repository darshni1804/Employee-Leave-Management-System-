"""
EmailService — Dedicated Notification Module for Technodha LeaveMate.

Provides static methods for sending plain-text email notifications
via Django's send_mail interface (Console Email Backend in dev).
"""

import logging
from typing import Optional
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

logger = logging.getLogger(__name__)

DEFAULT_SENDER = getattr(
    settings, "DEFAULT_FROM_EMAIL", "noreply@technodha-leavemate.local"
)

BRAND_FOOTER = """
Regards,

TECHNODHA LEAVEMATE
Smart Leave Management System
"""


class EmailService:
    """Independent email notification service."""

    @staticmethod
    def _send_text_email(
        subject: str,
        body: str,
        recipient: str,
        email_type: str,
    ) -> bool:
        """
        Internal helper method to send email safely with exception handling & logging.
        """
        if not recipient:
            logger.warning(
                "Email Skipped | Type: %s | Reason: No recipient address", email_type
            )
            return False

        full_body = f"{body.strip()}\n\n{BRAND_FOOTER.strip()}\n"

        try:
            send_mail(
                subject=subject,
                message=full_body,
                from_email=DEFAULT_SENDER,
                recipient_list=[recipient],
                fail_silently=False,
            )
            logger.info(
                "Email Sent | Type: %s | Recipient: %s", email_type, recipient
            )
            return True
        except Exception as e:
            logger.exception(
                "Email Failed | Type: %s | Recipient: %s | Error: %s",
                email_type,
                recipient,
                str(e),
            )
            return False

    @classmethod
    def send_leave_applied_email(cls, leave) -> bool:
        """Send email notification to manager when an employee submits leave."""
        employee = leave.employee
        manager = getattr(employee, "manager", None)
        recipient = manager.email if manager and manager.email else None

        # Fallback to admin/manager notification recipient if no direct manager email
        if not recipient and hasattr(employee, "email"):
            recipient = "manager@technodha-leavemate.local"

        dept = getattr(employee, "department", "N/A") or "General"
        duration_days = getattr(leave, "duration_days", None) or getattr(
            leave, "total_days", 1
        )
        created_str = (
            leave.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if getattr(leave, "created_at", None)
            else timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        subject = "New Leave Request Submitted"
        body = f"""
Hello Manager,

A new leave request has been submitted for review.

Leave Details:
- Employee Name: {employee.get_full_name() or employee.username}
- Employee ID: {getattr(employee, 'employee_id', employee.pk)}
- Department: {dept}
- Leave Dates: {leave.start_date} to {leave.end_date}
- Duration: {duration_days} Day(s)
- Reason: {leave.reason or 'N/A'}
- Current Status: {leave.status}
- Application Time: {created_str}

Reviewer Link:
http://localhost:5173/approvals
"""
        return cls._send_text_email(
            subject=subject,
            body=body,
            recipient=recipient,
            email_type="LEAVE_SUBMITTED",
        )

    @classmethod
    def send_leave_approved_email(cls, leave, reviewer=None) -> bool:
        """Send email notification to employee when leave is approved."""
        employee = leave.employee
        recipient = employee.email if employee else None

        duration_days = getattr(leave, "duration_days", None) or getattr(
            leave, "total_days", 1
        )
        reviewer_name = (
            reviewer.get_full_name() or reviewer.username
            if reviewer
            else "Manager"
        )
        review_date_str = timezone.now().strftime("%d %b %Y")

        subject = "Leave Request Approved"
        body = f"""
Hello {employee.get_full_name() or employee.username},

Your leave request has been approved.

Leave Details:
- Dates: {leave.start_date.strftime('%d %b %Y')} - {leave.end_date.strftime('%d %b %Y')}
- Duration: {duration_days} Day(s)
- Approved By: {reviewer_name}
- Manager Comment: {leave.reviewer_comment or 'Approved.'}
- Review Date: {review_date_str}
"""
        return cls._send_text_email(
            subject=subject,
            body=body,
            recipient=recipient,
            email_type="LEAVE_APPROVED",
        )

    @classmethod
    def send_leave_rejected_email(cls, leave, reviewer=None) -> bool:
        """Send email notification to employee when leave is rejected."""
        employee = leave.employee
        recipient = employee.email if employee else None

        review_date_str = timezone.now().strftime("%d %b %Y")

        subject = "Leave Request Rejected"
        body = f"""
Hello {employee.get_full_name() or employee.username},

Your leave request has been rejected.

Leave Details:
- Dates: {leave.start_date.strftime('%d %b %Y')} - {leave.end_date.strftime('%d %b %Y')}
- Reason for Request: {leave.reason or 'N/A'}
- Manager Comment: {leave.reviewer_comment or 'Request rejected.'}
- Review Date: {review_date_str}
"""
        return cls._send_text_email(
            subject=subject,
            body=body,
            recipient=recipient,
            email_type="LEAVE_REJECTED",
        )

    @classmethod
    def send_leave_cancelled_email(cls, leave) -> bool:
        """Send email notification to manager when employee cancels pending leave."""
        employee = leave.employee
        manager = getattr(employee, "manager", None)
        recipient = manager.email if manager and manager.email else None

        if not recipient:
            recipient = "manager@technodha-leavemate.local"

        cancellation_time_str = timezone.now().strftime("%Y-%m-%d %H:%M:%S")

        subject = "Leave Request Cancelled"
        body = f"""
Hello Manager,

A leave request has been cancelled by the employee.

Cancelled Request Details:
- Employee Name: {employee.get_full_name() or employee.username}
- Leave Dates: {leave.start_date} to {leave.end_date}
- Cancellation Time: {cancellation_time_str}
"""
        return cls._send_text_email(
            subject=subject,
            body=body,
            recipient=recipient,
            email_type="LEAVE_CANCELLED",
        )
