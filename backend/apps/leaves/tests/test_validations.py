"""
Tests for all business-rule validations on leave requests.

Covers:
    ✓ Past date rejected           (Rule 2)
    ✓ End date validation          (Rule 3)
    ✓ Overlap validation           (Rule 4)
    ✓ Annual limit validation      (Rule 1)
"""
from datetime import date, timedelta

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.leaves.models import LeaveRequest, LeaveStatus
from apps.leaves.tests.fixtures import (
    TOMORROW,
    DAY_AFTER,
    YESTERDAY,
    make_employee,
    make_leave_request,
)


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


class ValidationTests(APITestCase):
    """Business rule validation tests for the apply-leave endpoint."""

    def setUp(self):
        self.employee = make_employee("emp_valid")
        self.token = get_tokens(self.employee)
        self.url = "/api/v1/leaves/"
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    # ── Rule 2 — Past date ────────────────────────────────

    def test_past_start_date_rejected(self):
        """
        Rule 2: start_date before today must be rejected with 400.
        """
        payload = {
            "start_date": str(YESTERDAY),
            "end_date": str(TOMORROW),
        }
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        self.assertFalse(body["success"])

    def test_today_start_date_allowed(self):
        """
        start_date == today should be accepted (not in the past).
        """
        today = date.today()
        payload = {
            "start_date": str(today),
            "end_date": str(today),
        }
        response = self.client.post(self.url, payload)
        # today is the boundary — should succeed
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # ── Rule 3 — End date before start date ──────────────

    def test_end_date_before_start_date_rejected(self):
        """
        Rule 3: end_date < start_date must be rejected with 400.
        """
        payload = {
            "start_date": str(DAY_AFTER),
            "end_date": str(TOMORROW),  # one day before start
        }
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        self.assertFalse(body["success"])

    def test_same_start_and_end_date_allowed(self):
        """
        A single-day leave (start == end) should be accepted.
        """
        payload = {
            "start_date": str(TOMORROW),
            "end_date": str(TOMORROW),
        }
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # ── Rule 4 — Overlap ─────────────────────────────────

    def test_overlapping_approved_leave_rejected(self):
        """
        Rule 4: A new request that overlaps with an APPROVED leave must be rejected.
        """
        # Create an approved leave next week (Mon to Wed)
        next_monday = TOMORROW + timedelta(days=(7 - TOMORROW.weekday()))
        next_wednesday = next_monday + timedelta(days=2)
        make_leave_request(
            self.employee,
            start_date=next_monday,
            end_date=next_wednesday,
            status=LeaveStatus.APPROVED,
        )

        # Try to apply for a leave that overlaps (Tuesday to Thursday)
        payload = {
            "start_date": str(next_monday + timedelta(days=1)),
            "end_date": str(next_wednesday + timedelta(days=1)),
        }
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        self.assertFalse(body["success"])

    def test_pending_leave_does_not_block_new_request(self):
        """
        A PENDING leave should NOT trigger the overlap rule.
        Only APPROVED leaves block new requests.
        """
        start = date.today() + timedelta(days=10)
        end = start + timedelta(days=2)
        make_leave_request(
            self.employee,
            start_date=start,
            end_date=end,
            status=LeaveStatus.PENDING,
        )

        # Apply for the exact same dates — should succeed (PENDING doesn't block)
        payload = {"start_date": str(start), "end_date": str(end)}
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_non_overlapping_leave_allowed(self):
        """
        A new leave that does not overlap any existing approved leave must succeed.
        """
        start_a = date.today() + timedelta(days=5)
        end_a = start_a + timedelta(days=2)
        make_leave_request(
            self.employee,
            start_date=start_a,
            end_date=end_a,
            status=LeaveStatus.APPROVED,
        )

        # Apply for a week later
        start_b = end_a + timedelta(days=5)
        end_b = start_b + timedelta(days=1)
        payload = {"start_date": str(start_b), "end_date": str(end_b)}
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # ── Rule 1 — Annual limit ─────────────────────────────

    def test_annual_limit_exceeded_rejected(self):
        """
        Rule 1: Total approved days >= 20 must block a new request.
        """
        # Create an approved leave consuming exactly 20 days
        current_year = date.today().year
        big_start = date(current_year, 1, 2)   # safe past date for DB insert
        big_end = date(current_year, 1, 21)    # 20 days inclusive

        LeaveRequest.objects.create(
            employee=self.employee,
            start_date=big_start,
            end_date=big_end,
            total_days=20,
            reason="Already used",
            status=LeaveStatus.APPROVED,
        )

        # Now try to apply for one more day this year
        payload = {
            "start_date": str(TOMORROW),
            "end_date": str(TOMORROW),
        }
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        body = response.json()
        self.assertFalse(body["success"])
        self.assertIn("balance", body["message"].lower())

    def test_partial_limit_still_allows_short_leave(self):
        """
        If 18 days are used, a 2-day leave should still succeed.
        """
        current_year = date.today().year
        LeaveRequest.objects.create(
            employee=self.employee,
            start_date=date(current_year, 1, 2),
            end_date=date(current_year, 1, 19),
            total_days=18,
            reason="Already used",
            status=LeaveStatus.APPROVED,
        )

        payload = {
            "start_date": str(TOMORROW),
            "end_date": str(DAY_AFTER),  # 2 days
        }
        response = self.client.post(self.url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
