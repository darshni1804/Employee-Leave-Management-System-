"""
Accounts serializers.

Serializers for Login, User Details, Token Refresh, and Logout.
"""
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer exposing complete user information."""

    name = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "first_name",
            "last_name",
            "email",
            "role",
            "employee_id",
            "department",
            "phone_number",
            "profile_picture",
            "manager",
            "manager_name",
            "date_of_joining",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "date_joined", "name", "manager_name"]

    def get_name(self, obj) -> str:
        return obj.name

    def get_manager_name(self, obj) -> str | None:
        if obj.manager:
            return obj.manager.name
        return None


class LoginSerializer(serializers.Serializer):
    """Serializer for user authentication via Email or Employee ID."""

    email_or_employee_id = serializers.CharField(
        required=True,
        error_messages={"blank": "Please provide an email address or Employee ID."},
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        error_messages={"blank": "Please enter your password."},
    )


class TokenRefreshInputSerializer(serializers.Serializer):
    """Serializer for refreshing access tokens."""

    refresh = serializers.CharField(
        required=True,
        error_messages={"blank": "Refresh token is required."},
    )


class LogoutInputSerializer(serializers.Serializer):
    """Serializer for token blacklisting on logout."""

    refresh = serializers.CharField(
        required=True,
        error_messages={"blank": "Refresh token is required for logout."},
    )


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for new user registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "role",
            "employee_id",
            "department",
            "phone_number",
            "date_of_joining",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return attrs


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "phone_number",
            "department",
            "profile_picture",
        ]
