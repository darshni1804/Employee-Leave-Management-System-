"""
Unit tests for EmailService in Notifications module.
"""
from datetime import date, timedelta
from unittest.mock import patch

from django.core import mail
from django.test import TestCase

from apps.accounts.models import User, UserRole
from apps.leaves.models import LeaveRequest, LeaveStatus
from apps.leaves.services import LeavesService
from apps.notifications.email_service import EmailService


class EmailServiceTests(TestCase):
    """Test suite for EmailService methods and error handling."""

    def setUp(self):
        self.manager = User.objects.create_user(
            email="manager@example.com",
            username="manager1",
            password="Password123!",
            first_name="Jane",
            last_name="Manager",
            role=UserRole.MANAGER,
            employee_id="MGR001",
        )
        self.employee = User.objects.create_user(
            email="employee@example.com",
            username="employee1",
            password="Password123!",
            first_name="John",
            last_name="Doe",
            role=UserRole.EMPLOYEE,
            employee_id="EMP001",
            manager=self.manager,
        )
        self.tomorrow = date.today() + timedelta(days=1)
        self.day_after = date.today() + timedelta(days=3)

    def test_send_leave_applied_email(self):
        """Verify leave applied notification email is sent to manager."""
        leave = LeavesService.submit_leave(
            self.employee,
            {
                "start_date": self.tomorrow,
                "end_date": self.day_after,
                "reason": "Vacation leave",
            },
        )
        # Flush outbox in case on_commit was triggered
        sent = EmailService.send_leave_applied_email(leave)
        self.assertTrue(sent)
        self.assertGreaterEqual(len(mail.outbox), 1)

        email = mail.outbox[-1]
        self.assertIn("New Leave Request Submitted", email.subject)
        self.assertEqual(email.to, ["manager@example.com"])
        self.assertIn("John Doe", email.body)
        self.assertIn("Vacation leave", email.body)
        self.assertIn("TECHNODHA LEAVEMATE", email.body)

    def test_send_leave_approved_email(self):
        """Verify leave approved notification email is sent to employee."""
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            start_date=self.tomorrow,
            end_date=self.day_after,
            total_days=3,
            reason="Medical leave",
            status=LeaveStatus.PENDING,
        )
        approved_leave = LeavesService.approve_leave(
            leave.pk, self.manager, comment="Approved. Get well soon."
        )

        sent = EmailService.send_leave_approved_email(approved_leave, self.manager)
        self.assertTrue(sent)

        email = mail.outbox[-1]
        self.assertIn("Leave Request Approved", email.subject)
        self.assertEqual(email.to, ["employee@example.com"])
        self.assertIn("Approved. Get well soon.", email.body)
        self.assertIn("Jane Manager", email.body)

    def test_send_leave_rejected_email(self):
        """Verify leave rejected notification email is sent to employee."""
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            start_date=self.tomorrow,
            end_date=self.day_after,
            total_days=3,
            reason="Personal leave",
            status=LeaveStatus.PENDING,
        )
        rejected_leave = LeavesService.reject_leave(
            leave.pk, self.manager, comment="Conflict with team schedule."
        )

        sent = EmailService.send_leave_rejected_email(rejected_leave, self.manager)
        self.assertTrue(sent)

        email = mail.outbox[-1]
        self.assertIn("Leave Request Rejected", email.subject)
        self.assertEqual(email.to, ["employee@example.com"])
        self.assertIn("Conflict with team schedule.", email.body)

    def test_send_leave_cancelled_email(self):
        """Verify leave cancelled notification email is sent to manager."""
        leave = LeaveRequest.objects.create(
            employee=self.employee,
            start_date=self.tomorrow,
            end_date=self.day_after,
            total_days=3,
            reason="Personal leave",
            status=LeaveStatus.PENDING,
        )
        cancelled_leave = LeavesService.cancel_leave(leave.pk, self.employee)

        sent = EmailService.send_leave_cancelled_email(cancelled_leave)
        self.assertTrue(sent)

        email = mail.outbox[-1]
        self.assertIn("Leave Request Cancelled", email.subject)
        self.assertEqual(email.to, ["manager@example.com"])
        self.assertIn("John Doe", email.body)

    @patch("apps.notifications.email_service.send_mail")
    def test_email_exception_graceful_handling(self, mock_send_mail):
        """Verify that an exception during email sending returns False and does not crash."""
        mock_send_mail.side_effect = Exception("SMTP Connection Timeout Error")

        leave = LeaveRequest.objects.create(
            employee=self.employee,
            start_date=self.tomorrow,
            end_date=self.day_after,
            total_days=3,
            reason="Test error handling",
            status=LeaveStatus.PENDING,
        )

        # Calling EmailService directly when send_mail fails
        result = EmailService.send_leave_applied_email(leave)
        self.assertFalse(result)

        # Service operation still succeeds
        approved_leave = LeavesService.approve_leave(leave.pk, self.manager)
        self.assertEqual(approved_leave.status, LeaveStatus.APPROVED)
