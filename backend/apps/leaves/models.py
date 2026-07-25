"""
Leaves models.

Models:
- LeaveType      : Types of leave (Annual, Sick, Casual, etc.)
- LeaveRequest   : An employee's leave application
- LeaveBalance   : Per-user balance tracking per leave type
"""
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class LeaveStatus(models.TextChoices):
    PENDING = "PENDING", _("Pending")
    APPROVED = "APPROVED", _("Approved")
    REJECTED = "REJECTED", _("Rejected")
    CANCELLED = "CANCELLED", _("Cancelled")


class LeaveType(models.Model):
    """
    Defines a category of leave (Annual Leave, Sick Leave, etc.).
    """

    name = models.CharField(max_length=100, unique=True, verbose_name=_("Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    max_days_per_year = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Max Days Per Year"),
        help_text="0 means unlimited.",
    )
    requires_approval = models.BooleanField(default=True, verbose_name=_("Requires Approval"))
    is_paid = models.BooleanField(default=True, verbose_name=_("Is Paid"))
    is_active = models.BooleanField(default=True, verbose_name=_("Is Active"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "leaves_leave_type"
        verbose_name = _("Leave Type")
        verbose_name_plural = _("Leave Types")
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class LeaveRequest(models.Model):
    """
    An individual leave request submitted by an employee.
    """

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leave_requests",
        verbose_name=_("Employee"),
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="leave_requests",
        verbose_name=_("Leave Type"),
    )
    start_date = models.DateField(verbose_name=_("Start Date"))
    end_date = models.DateField(verbose_name=_("End Date"))
    total_days = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Total Days"),
        help_text="Calculated automatically.",
    )
    reason = models.TextField(blank=True, verbose_name=_("Reason"))
    status = models.CharField(
        max_length=20,
        choices=LeaveStatus.choices,
        default=LeaveStatus.PENDING,
        db_index=True,
        verbose_name=_("Status"),
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_leave_requests",
        verbose_name=_("Reviewed By"),
    )
    reviewer_comment = models.TextField(blank=True, verbose_name=_("Reviewer Comment"))
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name=_("Reviewed At"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "leaves_leave_request"
        verbose_name = _("Leave Request")
        verbose_name_plural = _("Leave Requests")
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.employee} — {self.leave_type} ({self.start_date} to {self.end_date})"


class LeaveBalance(models.Model):
    """
    Tracks remaining leave balance per employee per leave type per year.
    """

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="leave_balances",
        verbose_name=_("Employee"),
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.CASCADE,
        related_name="balances",
        verbose_name=_("Leave Type"),
    )
    year = models.PositiveIntegerField(verbose_name=_("Year"))
    allocated_days = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0,
        verbose_name=_("Allocated Days"),
    )
    used_days = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0,
        verbose_name=_("Used Days"),
    )
    remaining_days = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0,
        verbose_name=_("Remaining Days"),
    )

    class Meta:
        db_table = "leaves_leave_balance"
        verbose_name = _("Leave Balance")
        verbose_name_plural = _("Leave Balances")
        unique_together = [["employee", "leave_type", "year"]]
        ordering = ["-year", "leave_type__name"]

    def __str__(self) -> str:
        return f"{self.employee} — {self.leave_type} ({self.year}): {self.remaining_days} days"
