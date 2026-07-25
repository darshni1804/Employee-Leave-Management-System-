"""
Accounts admin configuration.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from apps.accounts.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin for the User model."""

    list_display = [
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "department",
        "is_active",
        "is_staff",
    ]
    list_filter = ["role", "is_active", "is_staff", "department"]
    search_fields = ["username", "email", "first_name", "last_name", "employee_id"]
    ordering = ["last_name", "first_name"]

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            _("Employee Information"),
            {
                "fields": (
                    "role",
                    "employee_id",
                    "department",
                    "phone_number",
                    "profile_picture",
                    "manager",
                    "date_of_joining",
                )
            },
        ),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (
            _("Employee Information"),
            {
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "role",
                    "employee_id",
                    "department",
                )
            },
        ),
    )
