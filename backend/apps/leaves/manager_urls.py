"""
Manager URLs configuration.

Endpoints:
    GET    /api/v1/manager/leaves/              List all leave requests
    GET    /api/v1/manager/leaves/{id}/         Retrieve leave detail
    PATCH  /api/v1/manager/leaves/{id}/approve/ Approve a leave request
    PATCH  /api/v1/manager/leaves/{id}/reject/  Reject a leave request
    GET    /api/v1/manager/statistics/          Manager leave statistics
"""
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.leaves.manager_views import ManagerLeaveViewSet, ManagerStatisticsView

app_name = "manager"

router = DefaultRouter()
router.register(r"leaves", ManagerLeaveViewSet, basename="manager-leaves")

urlpatterns = [
    path("statistics/", ManagerStatisticsView.as_view(), name="manager-statistics"),
    path("", include(router.urls)),
]
