"""
Accounts custom permissions.

Reusable permissions:
- IsEmployee        : Any authenticated employee, manager, or admin
- IsManager         : Authenticated user with MANAGER or ADMIN role
- IsAdmin           : Authenticated user with ADMIN role
- AuthenticatedOnly : Any authenticated user
- IsOwnerOrAdmin    : User operating on their own record or an Admin
"""
from rest_framework.permissions import BasePermission

from apps.accounts.models import UserRole


class AuthenticatedOnly(BasePermission):
    """Allow access only to authenticated users."""

    message = "Authentication required."

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated)


class IsEmployee(BasePermission):
    """Allow access to any authenticated employee, manager, or admin."""

    message = "You must be an authenticated employee to perform this action."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
        )


class IsManager(BasePermission):
    """Allow access to users with MANAGER or ADMIN role."""

    message = "You must be a manager or admin to perform this action."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and (request.user.role in (UserRole.MANAGER, UserRole.ADMIN) or request.user.is_superuser)
        )


class IsAdmin(BasePermission):
    """Allow access only to users with ADMIN role or superusers."""

    message = "You must be an admin to perform this action."

    def has_permission(self, request, view) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and (request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow object owner or admin to access object."""

    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == UserRole.ADMIN or request.user.is_superuser:
            return True
        return obj == request.user
