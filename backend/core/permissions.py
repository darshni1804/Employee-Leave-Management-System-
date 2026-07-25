"""
Shared permission classes for the core module.

App-specific permissions live in their own apps.
This file provides cross-cutting permission helpers.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthenticatedOrReadOnly(BasePermission):
    """Allow GET/HEAD/OPTIONS to anyone; other methods require auth."""

    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class ReadOnly(BasePermission):
    """Allow only safe (read) methods."""

    def has_permission(self, request, view) -> bool:
        return request.method in SAFE_METHODS
