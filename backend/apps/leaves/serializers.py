"""
Leaves serializers.

Naming follows assignment spec:
    LeaveCreateSerializer   — Input: apply for leave
    LeaveListSerializer     — Output: compact list view
    LeaveDetailSerializer   — Output: full detail view
    CancelLeaveSerializer   — Input: cancel (empty body, no fields)

Legacy serializers (LeaveTypeSerializer, LeaveRequestSerializer,
CreateLeaveRequestSerializer, ReviewLeaveRequestSerializer,
LeaveBalanceSerializer) are retained unchanged to avoid breaking
existing manager/admin endpoints.
"""
from datetime import date

from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.leaves.models import LeaveBalance, LeaveRequest, LeaveStatus, LeaveType


# ──────────────────────────────────────────────────────────
# Shared helpers
# ──────────────────────────────────────────────────────────

class LeaveTypeSerializer(serializers.ModelSerializer):
    """Serializer for leave type definitions (admin/manager CRUD)."""

    class Meta:
        model = LeaveType
        fields = [
            "id",
            "name",
            "description",
            "max_days_per_year",
            "requires_approval",
            "is_paid",
            "is_active",
        ]
        read_only_fields = ["id"]


# ──────────────────────────────────────────────────────────
# Phase 2 — Employee-Facing Serializers
# ──────────────────────────────────────────────────────────

class LeaveCreateSerializer(serializers.Serializer):
    """
    Input serializer for applying for leave.

    Validates:
        - start_date is not in the past  (Rule 2)
        - end_date >= start_date         (Rule 3)

    Rules 1 (annual limit) and 4 (overlap) require DB queries so they
    are enforced inside ``LeavesService.submit_leave()``.
    """

    start_date = serializers.DateField()
    end_date = serializers.DateField()
    reason = serializers.CharField(
        allow_blank=True,
        required=False,
        default="",
        max_length=1000,
        help_text="Optional reason for the leave request.",
    )

    def validate_start_date(self, value: date) -> date:
        """Rule 2 — Start date must not be in the past."""
        if value < date.today():
            raise serializers.ValidationError(
                "Start date cannot be in the past."
            )
        return value

    def validate(self, attrs: dict) -> dict:
        """Rule 3 — End date must not be before start date."""
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        if start and end and end < start:
            raise serializers.ValidationError(
                {"end_date": "End date cannot be before start date."}
            )
        return attrs


class LeaveListSerializer(serializers.ModelSerializer):
    """
    Compact read serializer for the leave list endpoint.

    Intentionally lightweight — no nested objects to keep list queries fast.
    """

    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    duration_days = serializers.IntegerField(source="total_days", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "start_date",
            "end_date",
            "duration_days",
            "reason",
            "status",
            "status_display",
            "created_at",
        ]
        read_only_fields = fields


class LeaveDetailSerializer(serializers.ModelSerializer):
    """
    Full read serializer for the leave detail endpoint.

    Includes nested employee and reviewer info.
    """

    employee = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    duration_days = serializers.IntegerField(source="total_days", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "employee",
            "start_date",
            "end_date",
            "duration_days",
            "reason",
            "status",
            "status_display",
            "reviewed_by",
            "reviewer_comment",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class CancelLeaveSerializer(serializers.Serializer):
    """
    Input serializer for cancelling a leave request.

    No body fields required — the action is implicit from the URL.
    Kept as an explicit serializer so DRF schema generation works correctly.
    """


# ──────────────────────────────────────────────────────────
# Legacy serializers — retained for manager / admin flows
# ──────────────────────────────────────────────────────────

class LeaveRequestSerializer(serializers.ModelSerializer):
    """Read serializer for leave requests (manager / admin views)."""

    employee = UserSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            "id",
            "employee",
            "start_date",
            "end_date",
            "total_days",
            "reason",
            "status",
            "status_display",
            "reviewed_by",
            "reviewer_comment",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "employee",
            "total_days",
            "status",
            "reviewed_by",
            "reviewer_comment",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]


class CreateLeaveRequestSerializer(serializers.ModelSerializer):
    """
    Legacy write serializer for submitting leave requests.

    Retained for backward compatibility with existing views.
    New code should use ``LeaveCreateSerializer``.
    """

    class Meta:
        model = LeaveRequest
        fields = [
            "start_date",
            "end_date",
            "reason",
        ]

    def validate(self, attrs):
        if attrs["start_date"] > attrs["end_date"]:
            raise serializers.ValidationError(
                {"end_date": "End date must be on or after start date."}
            )
        return attrs


class ReviewLeaveRequestSerializer(serializers.Serializer):
    """Serializer for approve/reject actions (Phase 3)."""

    comment = serializers.CharField(allow_blank=True, default="")


class LeaveBalanceSerializer(serializers.ModelSerializer):
    """Serializer for leave balance entries."""

    leave_type = LeaveTypeSerializer(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = [
            "id",
            "leave_type",
            "year",
            "allocated_days",
            "used_days",
            "remaining_days",
        ]
        read_only_fields = ["id", "used_days", "remaining_days"]
