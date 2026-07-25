"""
Leaves admin configuration.
"""
from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from apps.leaves.models import LeaveBalance, LeaveRequest, LeaveType


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "max_days_per_year", "is_paid", "requires_approval", "is_active"]
    list_filter = ["is_paid", "requires_approval", "is_active"]
    search_fields = ["name"]


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = [
        "employee",
        "leave_type",
        "start_date",
        "end_date",
        "total_days",
        "status",
        "reviewed_by",
        "created_at",
    ]
    list_filter = ["status", "leave_type"]
    search_fields = ["employee__username", "employee__email", "employee__first_name"]
    readonly_fields = ["total_days", "created_at", "updated_at"]
    date_hierarchy = "created_at"

    fieldsets = (
        (_("Request Details"), {"fields": ("employee", "leave_type", "start_date", "end_date", "total_days", "reason")}),
        (_("Review"), {"fields": ("status", "reviewed_by", "reviewer_comment", "reviewed_at")}),
        (_("Timestamps"), {"fields": ("created_at", "updated_at")}),
    )


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ["employee", "leave_type", "year", "allocated_days", "used_days", "remaining_days"]
    list_filter = ["year", "leave_type"]
    search_fields = ["employee__username", "employee__email"]
