"""
Tests for the PATCH /api/v1/leaves/{id}/cancel/ endpoint.

Covers:
    ✓ Cancel pending leave (happy path)
    ✓ Cannot cancel approved leave
    ✓ Cannot cancel rejected leave
    ✓ Cannot cancel already-cancelled leave
    ✓ Cannot cancel another employee's leave
    ✓ Non-existent leave returns 404
"""
from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.leaves.models import LeaveStatus
from apps.leaves.tests.fixtures import (
    TOMORROW,
    DAY_AFTER,
    make_employee,
    make_leave_request,
)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


class CancelLeaveTest(APITestCase):
    """Tests for the cancel-leave endpoint."""

    def setUp(self):
        self.employee = make_employee("emp_cancel")
        self.token = get_tokens(self.employee)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def _cancel_url(self, pk):
        return f"/api/v1/leaves/{pk}/cancel/"

    # ── Happy path ────────────────────────────────────────

    def test_cancel_pending_leave_success(self):
        """
        Rule 5 (pass): A PENDING leave request can be cancelled by its owner.
        """
        leave = make_leave_request(self.employee, status=LeaveStatus.PENDING)
        response = self.client.patch(self._cancel_url(leave.pk))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["status"], LeaveStatus.CANCELLED)

        leave.refresh_from_db()
        self.assertEqual(leave.status, LeaveStatus.CANCELLED)

    def test_cancel_response_envelope(self):
        """Cancel response must include success, message, and data."""
        leave = make_leave_request(self.employee, status=LeaveStatus.PENDING)
        response = self.client.patch(self._cancel_url(leave.pk))
        body = response.json()
        self.assertIn("success", body)
        self.assertIn("message", body)
        self.assertIn("data", body)

    # ── Rule 5 violations ─────────────────────────────────

    def test_cannot_cancel_approved_leave(self):
        """
        Rule 5 (fail): APPROVED leave cannot be cancelled.
        """
        leave = make_leave_request(self.employee, status=LeaveStatus.APPROVED)
        response = self.client.patch(self._cancel_url(leave.pk))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        self.assertFalse(body["success"])
        # Status should remain APPROVED
        leave.refresh_from_db()
        self.assertEqual(leave.status, LeaveStatus.APPROVED)

    def test_cannot_cancel_rejected_leave(self):
        """
        Rule 5 (fail): REJECTED leave cannot be cancelled.
        """
        leave = make_leave_request(self.employee, status=LeaveStatus.REJECTED)
        response = self.client.patch(self._cancel_url(leave.pk))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        self.assertFalse(body["success"])

    def test_cannot_cancel_already_cancelled_leave(self):
        """
        Rule 5 (fail): Already CANCELLED leave cannot be cancelled again.
        """
        leave = make_leave_request(self.employee, status=LeaveStatus.CANCELLED)
        response = self.client.patch(self._cancel_url(leave.pk))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        self.assertFalse(body["success"])

    # ── Ownership & Auth ──────────────────────────────────

    def test_cannot_cancel_other_employees_leave(self):
        """
        An employee must not be able to cancel another employee's leave.
        """
        other_employee = make_employee("emp_other_cancel")
        other_leave = make_leave_request(other_employee, status=LeaveStatus.PENDING)

        response = self.client.patch(self._cancel_url(other_leave.pk))
        # Should get 403 (ownership check) or 404 (queryset scoped to self)
        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )

    def test_cancel_nonexistent_leave_returns_404(self):
        """Cancelling a non-existent leave ID must return 404."""
        response = self.client.patch(self._cancel_url(99999))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_cancel_blocked(self):
        """Unauthenticated cancel request must return 401."""
        leave = make_leave_request(self.employee, status=LeaveStatus.PENDING)
        self.client.credentials()  # remove auth
        response = self.client.patch(self._cancel_url(leave.pk))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
