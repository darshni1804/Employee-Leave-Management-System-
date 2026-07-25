"""
Test fixtures and shared utilities for leaves tests.

Provides:
    - EmployeeFactory      : Create employee users quickly
    - make_leave_request() : Create LeaveRequest instances in any status
    - api_client()         : Authenticated DRF test client helper
"""
from datetime import date, timedelta

from django.contrib.auth import get_user_model

from apps.leaves.models import LeaveRequest, LeaveStatus

User = get_user_model()

# ── Sentinel date: tomorrow (always valid start_date) ────
TOMORROW = date.today() + timedelta(days=1)
DAY_AFTER = date.today() + timedelta(days=2)
YESTERDAY = date.today() - timedelta(days=1)


def make_employee(username: str = "emp1", role: str = "EMPLOYEE") -> User:
    """Create and return a test employee user."""
    return User.objects.create_user(
        username=username,
        email=f"{username}@test.com",
        password="TestPass123!",
        first_name="Test",
        last_name="User",
        role=role,
    )


def make_leave_request(
    employee: User,
    start_date: date | None = None,
    end_date: date | None = None,
    status: str = LeaveStatus.PENDING,
    total_days: int | None = None,
) -> LeaveRequest:
    """Create and return a LeaveRequest with the given attributes."""
    start_date = start_date or TOMORROW
    end_date = end_date or DAY_AFTER
    days = total_days or ((end_date - start_date).days + 1)

    return LeaveRequest.objects.create(
        employee=employee,
        start_date=start_date,
        end_date=end_date,
        total_days=days,
        reason="Test leave",
        status=status,
    )
