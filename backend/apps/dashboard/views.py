"""
Dashboard views.
"""
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.dashboard.serializers import DashboardSerializer
from apps.dashboard.services import DashboardService


class DashboardStatsView(APIView):
    """
    GET /api/v1/dashboard/stats/

    Returns aggregated statistics scoped to the requesting user's role.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = DashboardSerializer  # for drf-spectacular

    def get(self, request):
        # TODO: Call DashboardService.get_dashboard_data()
        raise NotImplementedError("Implement DashboardStatsView.get()")
