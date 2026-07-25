"""
Leaves custom permissions.

Permissions defined here:
    IsEmployeeOnly   — Authenticated user with EMPLOYEE role only
                       (MANAGER and ADMIN are explicitly blocked).
    IsLeaveOwner     — Object-level: leave belongs to the requesting user.
"""
from rest_framework.permissions import BasePermission

from apps.accounts.models import UserRole


class IsEmployeeOnly(BasePermission):
    """
    Allow access exclusively to authenticated users with the EMPLOYEE role.

    Managers and Admins are intentionally blocked from employee-facing
    leave endpoints to enforce role separation.
    """

    message = "This endpoint is restricted to employees only."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.role == UserRole.EMPLOYEE
        )


class IsLeaveOwner(BasePermission):
    """
    Object-level permission: the authenticated user must own the leave request.

    Call ``get_object()`` first so DRF triggers this check automatically.
    """

    message = "You can only access your own leave requests."

    def has_object_permission(self, request, view, obj) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False
        return obj.employee_id == request.user.pk
