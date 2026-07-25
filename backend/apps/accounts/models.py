"""
Accounts models.

Defines a custom User model with role-based access.
Roles: EMPLOYEE, MANAGER, ADMIN
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    """Available user roles within the system."""
    EMPLOYEE = "EMPLOYEE", _("Employee")
    MANAGER = "MANAGER", _("Manager")
    ADMIN = "ADMIN", _("Admin")


class User(AbstractUser):
    """
    Custom user model extending AbstractUser.

    Added & Overridden fields:
    - email         : Unique email address
    - employee_id   : Unique employee identifier
    - role          : User role (EMPLOYEE | MANAGER | ADMIN)
    - department    : Department name
    - phone_number  : Contact phone number
    - profile_picture: Profile image
    - manager       : Self-referential FK to the user's direct manager
    - date_of_joining: When the employee joined
    """

    email = models.EmailField(_("email address"), unique=True)
    employee_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        verbose_name=_("Employee ID"),
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
        db_index=True,
    )
    department = models.CharField(max_length=100, blank=True, verbose_name=_("Department"))
    phone_number = models.CharField(max_length=20, blank=True, verbose_name=_("Phone Number"))
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        null=True,
        blank=True,
        verbose_name=_("Profile Picture"),
    )
    manager = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subordinates",
        verbose_name=_("Manager"),
    )
    date_of_joining = models.DateField(null=True, blank=True, verbose_name=_("Date of Joining"))

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        db_table = "accounts_user"
        verbose_name = _("User")
        verbose_name_plural = _("Users")
        ordering = ["last_name", "first_name"]

    def __str__(self) -> str:
        return f"{self.get_full_name()} ({self.email})"

    @property
    def name(self) -> str:
        full = f"{self.first_name} {self.last_name}".strip()
        return full if full else self.username

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN or self.is_superuser

    @property
    def is_manager(self) -> bool:
        return self.role == UserRole.MANAGER or self.is_admin

    @property
    def is_employee(self) -> bool:
        return True
