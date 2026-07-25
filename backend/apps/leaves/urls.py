"""
Leaves URL configuration.

Employee-facing routes  → /api/v1/leaves/
Manager/Admin routes    → /api/v1/leaves/requests/
                          /api/v1/leaves/types/
                          /api/v1/leaves/balances/
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.leaves.views import (
    LeaveBalanceViewSet,
    LeaveRequestViewSet,
    LeaveTypeViewSet,
    LeaveViewSet,
)

app_name = "leaves"

router = DefaultRouter()

# ── Employee-facing ──────────────────────────────────────
# GET    /api/v1/leaves/              → list own leaves
# POST   /api/v1/leaves/              → apply for leave
# GET    /api/v1/leaves/{id}/         → retrieve own leave detail
# PATCH  /api/v1/leaves/{id}/cancel/  → cancel pending leave
router.register(r"", LeaveViewSet, basename="leaves")

# ── Manager / Admin (Phase 3) ────────────────────────────
router.register(r"types", LeaveTypeViewSet, basename="leave-types")
router.register(r"requests", LeaveRequestViewSet, basename="leave-requests")
router.register(r"balances", LeaveBalanceViewSet, basename="leave-balances")

urlpatterns = [
    path("", include(router.urls)),
]
