"""
Tests for Phase 4 — Manager Module.

Tests:
    - View all requests (manager permissions & employee 403)
    - Approve leave (PENDING -> APPROVED, non-PENDING fails with 400)
    - Reject leave (PENDING -> REJECTED, non-PENDING fails with 400)
    - Permissions checks
    - Filtering (status, start_date, end_date)
    - Search (employee name, employee ID, email, reason)
    - Pagination
    - Statistics endpoint
"""
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from apps.accounts.models import UserRole
from apps.leaves.models import LeaveRequest, LeaveStatus

User = get_user_model()


class ManagerModuleTests(APITestCase):

    def setUp(self):
        # Create Manager
        self.manager = User.objects.create_user(
            username="manager1",
            email="manager1@test.com",
            password="Password123!",
            first_name="Manager",
            last_name="One",
            role=UserRole.MANAGER,
            employee_id="MGR001",
            department="Engineering",
        )

        # Create Employees
        self.employee1 = User.objects.create_user(
            username="employee1",
            email="employee1@test.com",
            password="Password123!",
            first_name="John",
            last_name="Doe",
            role=UserRole.EMPLOYEE,
            employee_id="EMP001",
            department="Engineering",
        )

        self.employee2 = User.objects.create_user(
            username="employee2",
            email="employee2@test.com",
            password="Password123!",
            first_name="Jane",
            last_name="Smith",
            role=UserRole.EMPLOYEE,
            employee_id="EMP002",
            department="Marketing",
        )

        # Create leave requests
        self.today = date.today()
        self.tomorrow = self.today + timedelta(days=1)
        self.day_after = self.today + timedelta(days=2)

        self.pending_leave1 = LeaveRequest.objects.create(
            employee=self.employee1,
            start_date=self.tomorrow,
            end_date=self.day_after,
            total_days=2,
            reason="Vacation trip to Paris",
            status=LeaveStatus.PENDING,
        )

        self.pending_leave2 = LeaveRequest.objects.create(
            employee=self.employee2,
            start_date=self.tomorrow,
            end_date=self.day_after,
            total_days=2,
            reason="Sick leave rest",
            status=LeaveStatus.PENDING,
        )

        self.approved_leave = LeaveRequest.objects.create(
            employee=self.employee1,
            start_date=self.today + timedelta(days=10),
            end_date=self.today + timedelta(days=12),
            total_days=3,
            reason="Approved medical leave",
            status=LeaveStatus.APPROVED,
            reviewed_by=self.manager,
        )

        self.rejected_leave = LeaveRequest.objects.create(
            employee=self.employee2,
            start_date=self.today + timedelta(days=15),
            end_date=self.today + timedelta(days=16),
            total_days=2,
            reason="Conference attendance",
            status=LeaveStatus.REJECTED,
            reviewed_by=self.manager,
        )

    # ── Permission Tests ──────────────────────────────────────────────

    def test_employee_access_forbidden(self):
        """Employees must receive 403 Forbidden on all manager endpoints."""
        self.client.force_authenticate(user=self.employee1)

        # List leaves
        res = self.client.get("/api/v1/manager/leaves/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Approve leave
        res = self.client.patch(f"/api/v1/manager/leaves/{self.pending_leave1.id}/approve/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Reject leave
        res = self.client.patch(f"/api/v1/manager/leaves/{self.pending_leave1.id}/reject/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Statistics
        res = self.client.get("/api/v1/manager/statistics/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_access_unauthorized(self):
        """Unauthenticated requests must receive 401 Unauthorized."""
        res = self.client.get("/api/v1/manager/leaves/")
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manager_access_granted(self):
        """Managers can access manager endpoints successfully."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.get("/api/v1/manager/leaves/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["success"])

    # ── View All Requests, Pagination, Search & Filtering ───────────

    def test_view_all_requests(self):
        """Manager can view all employee leave requests."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.get("/api/v1/manager/leaves/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.data["data"]
        self.assertEqual(data["count"], 4)

    def test_filter_by_status(self):
        """Manager can filter leave requests by status."""
        self.client.force_authenticate(user=self.manager)

        # Filter PENDING
        res = self.client.get("/api/v1/manager/leaves/", {"status": "PENDING"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["data"]["count"], 2)

        # Filter APPROVED
        res = self.client.get("/api/v1/manager/leaves/", {"status": "APPROVED"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["data"]["count"], 1)

    def test_search_leaves(self):
        """Manager can search by employee name, employee ID, email, or reason."""
        self.client.force_authenticate(user=self.manager)

        # Search by employee name "John"
        res = self.client.get("/api/v1/manager/leaves/", {"search": "John"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["data"]["count"], 2)

        # Search by employee ID "EMP002"
        res = self.client.get("/api/v1/manager/leaves/", {"search": "EMP002"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["data"]["count"], 2)

        # Search by reason "Paris"
        res = self.client.get("/api/v1/manager/leaves/", {"search": "Paris"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["data"]["count"], 1)

    def test_pagination(self):
        """Pagination works correctly."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.get("/api/v1/manager/leaves/", {"page_size": 2, "page": 1})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data["data"]
        self.assertEqual(len(data["results"]), 2)
        self.assertEqual(data["total_pages"], 2)

    # ── Approve Leave Tests ──────────────────────────────────────────

    def test_approve_pending_leave_success(self):
        """Manager can approve a PENDING leave request."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.patch(
            f"/api/v1/manager/leaves/{self.pending_leave1.id}/approve/",
            {"comment": "Approved for vacation"},
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["success"])
        self.assertEqual(res.data["data"]["status"], "APPROVED")

        # Verify DB update
        self.pending_leave1.refresh_from_db()
        self.assertEqual(self.pending_leave1.status, LeaveStatus.APPROVED)
        self.assertEqual(self.pending_leave1.reviewed_by, self.manager)
        self.assertIsNotNone(self.pending_leave1.reviewed_at)
        self.assertEqual(self.pending_leave1.reviewer_comment, "Approved for vacation")

    def test_approve_already_approved_leave_fails(self):
        """Approving an already APPROVED leave request returns 400 Bad Request."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.patch(
            f"/api/v1/manager/leaves/{self.approved_leave.id}/approve/",
            {"comment": "Re-approve"},
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res.data["success"])

    # ── Reject Leave Tests ───────────────────────────────────────────

    def test_reject_pending_leave_success(self):
        """Manager can reject a PENDING leave request."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.patch(
            f"/api/v1/manager/leaves/{self.pending_leave2.id}/reject/",
            {"comment": "Staff shortage"},
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["success"])
        self.assertEqual(res.data["data"]["status"], "REJECTED")

        # Verify DB update
        self.pending_leave2.refresh_from_db()
        self.assertEqual(self.pending_leave2.status, LeaveStatus.REJECTED)
        self.assertEqual(self.pending_leave2.reviewed_by, self.manager)
        self.assertIsNotNone(self.pending_leave2.reviewed_at)
        self.assertEqual(self.pending_leave2.reviewer_comment, "Staff shortage")

    def test_reject_already_rejected_leave_fails(self):
        """Rejecting an already REJECTED leave request returns 400 Bad Request."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.patch(
            f"/api/v1/manager/leaves/{self.rejected_leave.id}/reject/",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res.data["success"])

    # ── Statistics Endpoint Test ─────────────────────────────────────

    def test_manager_statistics_endpoint(self):
        """Manager statistics endpoint returns expected count metrics."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.get("/api/v1/manager/statistics/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        stats = res.data["data"]
        self.assertIn("total_employees", stats)
        self.assertIn("pending_requests", stats)
        self.assertIn("approved_today", stats)
        self.assertIn("approved_total", stats)
        self.assertIn("rejected_total", stats)
        self.assertIn("cancelled_total", stats)

        self.assertEqual(stats["pending_requests"], 2)
        self.assertEqual(stats["approved_total"], 1)
        self.assertEqual(stats["rejected_total"], 1)
