"""
Accounts API views.

All business logic delegates to AccountsService.
All endpoints return consistent response format:
{
    "success": true,
    "message": "...",
    "data": { ... }
}
"""
from rest_framework import status, mixins
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from apps.accounts.permissions import AuthenticatedOnly, IsAdmin
from apps.accounts.serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    LogoutInputSerializer,
    RegisterSerializer,
    TokenRefreshInputSerializer,
    UpdateProfileSerializer,
    UserSerializer,
)
from apps.accounts.services import AccountsService
from apps.accounts.models import User


class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticate user via Email or Employee ID and return JWT tokens + user profile.
    """

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = AccountsService.authenticate_user(
            email_or_employee_id=serializer.validated_data["email_or_employee_id"],
            password=serializer.validated_data["password"],
        )

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": result,
            },
            status=status.HTTP_200_OK,
        )


class TokenRefreshView(APIView):
    """
    POST /api/auth/token/refresh/
    Obtain a new access token using a refresh token.
    """

    permission_classes = [AllowAny]
    serializer_class = TokenRefreshInputSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = AccountsService.refresh_access_token(
            refresh_token_str=serializer.validated_data["refresh"]
        )

        return Response(
            {
                "success": True,
                "message": "Access token refreshed successfully.",
                "data": result,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklist refresh token on logout.
    """

    permission_classes = [AllowAny]
    serializer_class = LogoutInputSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        AccountsService.logout_user(
            refresh_token_str=serializer.validated_data["refresh"]
        )

        return Response(
            {
                "success": True,
                "message": "Successfully logged out.",
                "data": {},
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """
    GET /api/auth/me/
    Retrieve currently authenticated user's profile.
    """

    permission_classes = [AuthenticatedOnly]
    serializer_class = UserSerializer

    def get(self, request):
        profile = AccountsService.get_user_profile(request.user)

        return Response(
            {
                "success": True,
                "message": "User details retrieved successfully.",
                "data": profile,
            },
            status=status.HTTP_200_OK,
        )


class RegisterView(GenericViewSet):
    """
    POST /api/auth/register/
    Register a new user account.
    """

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = AccountsService.register_user(serializer.validated_data)
        user_data = UserSerializer(user).data

        return Response(
            {
                "success": True,
                "message": "User registered successfully.",
                "data": user_data,
            },
            status=status.HTTP_201_CREATED,
        )


class UserAdminViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    GenericViewSet,
):
    """
    Admin-only ViewSet for managing all users.
    """

    permission_classes = [IsAdmin]
    serializer_class = UserSerializer
    queryset = User.objects.all().select_related("manager")
