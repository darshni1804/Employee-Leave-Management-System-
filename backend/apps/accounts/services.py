"""
Accounts service layer.

Encapsulates all authentication, user management, and token logic.
Views call this service layer directly.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

from core.exceptions import ServiceError
from apps.accounts.serializers import UserSerializer

if TYPE_CHECKING:
    from apps.accounts.models import User as UserType

logger = logging.getLogger(__name__)
User = get_user_model()


class AccountsService:
    """
    Service class encapsulating all accounts business logic.
    """

    @staticmethod
    def authenticate_user(email_or_employee_id: str, password: str) -> dict:
        """
        Authenticate a user by email, employee ID, or username.

        Returns:
            dict containing access token, refresh token, and user data.

        Raises:
            ServiceError on invalid credentials or inactive account.
        """
        identifier = email_or_employee_id.strip()

        # Query user by email (case-insensitive), employee_id, or username
        user = User.objects.filter(
            Q(email__iexact=identifier)
            | Q(employee_id__iexact=identifier)
            | Q(username__iexact=identifier)
        ).first()

        if not user or not user.check_password(password):
            raise ServiceError("Invalid email/employee ID or password.", status_code=401)

        if not user.is_active:
            raise ServiceError("User account is inactive.", status_code=403)

        # Generate SimpleJWT tokens
        refresh_token = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return {
            "access": str(refresh_token.access_token),
            "refresh": str(refresh_token),
            "user": user_data,
        }

    @staticmethod
    def refresh_access_token(refresh_token_str: str) -> dict:
        """
        Obtain a new access token given a valid refresh token.
        """
        try:
            refresh = RefreshToken(refresh_token_str)
            return {
                "access": str(refresh.access_token),
            }
        except (TokenError, InvalidToken) as exc:
            raise ServiceError("Invalid or expired refresh token.", status_code=401) from exc

    @staticmethod
    def logout_user(refresh_token_str: str) -> None:
        """
        Blacklist the refresh token on logout.
        """
        try:
            token = RefreshToken(refresh_token_str)
            token.blacklist()
        except (TokenError, InvalidToken) as exc:
            # Token is already invalid or expired, log warning and proceed cleanly
            logger.warning("Token blacklisting warning on logout: %s", exc)

    @staticmethod
    def get_user_profile(user: UserType) -> dict:
        """
        Retrieve serialized profile data for a given user.
        """
        return UserSerializer(user).data

    @staticmethod
    def register_user(validated_data: dict) -> UserType:
        """
        Create and return a new user.
        """
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    @staticmethod
    def update_profile(user: UserType, validated_data: dict) -> UserType:
        """
        Update user profile fields.
        """
        for attr, value in validated_data.items():
            setattr(user, attr, value)
        user.save()
        return user

    @staticmethod
    def change_password(user: UserType, old_password: str, new_password: str) -> None:
        """
        Validate old password and set new password.
        """
        if not user.check_password(old_password):
            raise ServiceError("Current password is incorrect.", status_code=400)
        user.set_password(new_password)
        user.save()
