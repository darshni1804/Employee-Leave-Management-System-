"""
Global exception handler for Django REST Framework.

Converts all exceptions to a standardised JSON error response::

    {
        "success": false,
        "message": "Human-readable error message",
        "errors": { ... }   # optional field-level errors
    }
"""
import logging

from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class ServiceError(Exception):
    """
    Base exception for service layer errors.

    Raise this in service methods to propagate business logic errors
    up to the view layer.

    Usage::

        raise ServiceError("Insufficient leave balance.", status_code=400)
    """

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler.

    Wraps all error responses in a consistent envelope.
    Referenced in settings: EXCEPTION_HANDLER = 'core.exceptions.custom_exception_handler'
    """
    # Handle custom ServiceError explicitly
    if isinstance(exc, ServiceError):
        return Response(
            {
                "success": False,
                "message": exc.message,
                "errors": {"detail": exc.message},
            },
            status=exc.status_code,
        )

    # Let DRF build the default response first
    response = exception_handler(exc, context)

    if response is not None:
        # DRF-handled exceptions (validation errors, auth errors, etc.)
        error_data = {
            "success": False,
            "message": _get_error_message(exc),
            "errors": response.data if isinstance(response.data, dict) else {"detail": response.data},
        }
        response.data = error_data
        return response

    # Non-DRF exceptions that slipped through
    if isinstance(exc, Http404):
        return Response(
            {"success": False, "message": "Resource not found.", "errors": {}},
            status=status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, PermissionDenied):
        return Response(
            {"success": False, "message": "You do not have permission to perform this action.", "errors": {}},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Unhandled server errors
    logger.exception("Unhandled exception: %s", exc, exc_info=True)
    return Response(
        {"success": False, "message": "An unexpected error occurred.", "errors": {}},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _get_error_message(exc: Exception) -> str:
    """Extract a clean human-readable message from an exception."""
    if hasattr(exc, "detail"):
        detail = exc.detail
        if isinstance(detail, str):
            return detail
        if isinstance(detail, list) and detail:
            return str(detail[0])
        if isinstance(detail, dict):
            # Return the first field's first error
            first_key = next(iter(detail))
            first_val = detail[first_key]
            if isinstance(first_val, list) and first_val:
                return f"{first_key}: {first_val[0]}"
            return f"{first_key}: {first_val}"
    return str(exc)
