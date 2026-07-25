"""
Management command to seed initial test users (1 Employee, 1 Manager).

Usage:
    python manage.py seed_users
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import UserRole

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds initial test users for Employee and Manager roles."

    def handle(self, *args, **options):
        self.stdout.write("Seeding users...")

        # 1. Create or update Manager
        manager, mgr_created = User.objects.get_or_create(
            email="manager@example.com",
            defaults={
                "username": "manager@example.com",
                "employee_id": "MGR001",
                "first_name": "Jane",
                "last_name": "Manager",
                "role": UserRole.MANAGER,
                "department": "Engineering",
                "is_staff": True,
            },
        )
        manager.set_password("Password123!")
        manager.role = UserRole.MANAGER
        manager.employee_id = "MGR001"
        manager.save()

        mgr_status = "Created" if mgr_created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(f"{mgr_status} Manager user: manager@example.com (MGR001)")
        )

        # 2. Create or update Employee
        employee, emp_created = User.objects.get_or_create(
            email="employee@example.com",
            defaults={
                "username": "employee@example.com",
                "employee_id": "EMP001",
                "first_name": "John",
                "last_name": "Employee",
                "role": UserRole.EMPLOYEE,
                "department": "Engineering",
                "manager": manager,
            },
        )
        employee.set_password("Password123!")
        employee.role = UserRole.EMPLOYEE
        employee.employee_id = "EMP001"
        employee.manager = manager
        employee.save()

        emp_status = "Created" if emp_created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(f"{emp_status} Employee user: employee@example.com (EMP001)")
        )

        self.stdout.write(self.style.SUCCESS("Users seeded successfully!"))
