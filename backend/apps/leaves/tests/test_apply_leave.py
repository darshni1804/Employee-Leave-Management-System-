"""
Tests for the POST /api/v1/leaves/ endpoint (apply leave).

Covers:
    ✓ Apply leave — happy path (PENDING leave created)
    ✓ Unauthenticated access blocked
    ✓ Manager blocked (IsEmployeeOnly permission)
    ✓ Response envelope: {success, message, data}
"""
from datetime import date, timedelta

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.leaves.models import LeaveRequest, LeaveStatus
from apps.leaves.tests.fixtures import TOMORROW, DAY_AFTER, make_employee


def get_tokens(user):
    """Return a Bearer token string for the given user."""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


class ApplyLeaveTest(APITestCase):
    """Tests for the apply-leave endpoint."""

    def setUp(self):
        self.employee = make_employee("emp_apply")
        self.token = get_tokens(self.employee)
        self.url = "/api/v1/leaves/"

    def _auth(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    # ── Happy path ────────────────────────────────────────

    def test_apply_leave_success(self):
        """Submitting a valid leave request creates a PENDING record."""
        self._auth()
        payload = {
            "start_date": str(TOMORROW),
            "end_date": str(DAY_AFTER),
            "reason": "Family event",
        }
        response = self.client.post(self.url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertIn("data", data)
        self.assertEqual(data["data"]["status"], LeaveStatus.PENDING)
        self.assertTrue(LeaveRequest.objects.filter(employee=self.employee).exists())

    def test_apply_leave_no_reason_allowed(self):
        """Reason field is optional — omitting it should still succeed."""
        self._auth()
        payload = {
            "start_date": str(TOMORROW),
            "end_date": str(TOMORROW),
        }
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # ── Auth & Permission ─────────────────────────────────

    def test_unauthenticated_blocked(self):
        """Unauthenticated requests must receive 401."""
        payload = {"start_date": str(TOMORROW), "end_date": str(DAY_AFTER)}
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manager_blocked(self):
        """Managers must receive 403 on employee-only endpoints."""
        manager = make_employee("mgr_apply", role="MANAGER")
        token = get_tokens(manager)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        payload = {"start_date": str(TOMORROW), "end_date": str(DAY_AFTER)}
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        body = response.json()
        self.assertFalse(body["success"])

    # ── Response envelope ─────────────────────────────────

    def test_response_envelope_shape(self):
        """Response must contain success, message, and data keys."""
        self._auth()
        payload = {"start_date": str(TOMORROW), "end_date": str(DAY_AFTER)}
        response = self.client.post(self.url, payload)
        body = response.json()
        self.assertIn("success", body)
        self.assertIn("message", body)
        self.assertIn("data", body)
