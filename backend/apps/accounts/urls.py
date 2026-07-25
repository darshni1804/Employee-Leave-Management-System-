"""
Accounts URL configuration.
"""
from django.urls import path
from apps.accounts.views import (
    LoginView,
    LogoutView,
    MeChangePasswordView,
    MeProfileUpdateView,
    MeView,
    RegisterView,
    TokenRefreshView,
    UserAdminViewSet,
)

app_name = "accounts"

urlpatterns = [
    # ─── Authentication ───────────────────────────────────────────
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("register/", RegisterView.as_view({"post": "create"}), name="register"),

    # ─── Current User ─────────────────────────────────────────────
    path("me/", MeView.as_view(), name="me"),
    path("me/profile/", MeProfileUpdateView.as_view(), name="me_profile"),
    path("me/change-password/", MeChangePasswordView.as_view(), name="me_change_password"),

    # ─── Admin: User Management ───────────────────────────────────
    path("users/", UserAdminViewSet.as_view({"get": "list"}), name="user_list"),
    path("users/<int:pk>/", UserAdminViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}), name="user_detail"),
]
