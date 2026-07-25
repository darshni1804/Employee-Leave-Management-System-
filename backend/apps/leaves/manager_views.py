"""
Manager-facing DRF views (Phase 4).

Only users with MANAGER or ADMIN role can access these endpoints.
Employees attempting to access will receive HTTP 403 Forbidden.

Endpoints:
    GET    /api/v1/manager/leaves/              List all leave requests
    GET    /api/v1/manager/leaves/{id}/         Retrieve leave request detail
    PATCH  /api/v1/manager/leaves/{id}/approve/ Approve a pending leave
    PATCH  /api/v1/manager/leaves/{id}/reject/  Reject a pending leave
    GET    /api/v1/manager/statistics/          Get employee leave statistics
"""
import logging

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet

from apps.accounts.permissions import IsManager
from apps.leaves.filters import LeaveRequestFilter
from apps.leaves.models import LeaveRequest
from apps.leaves.serializers import (
    ApproveRejectSerializer,
    ManagerLeaveSerializer,
    ManagerStatisticsSerializer,
)
from apps.leaves.services import LeavesService
from core.exceptions import ServiceError
from core.pagination import StandardResultsPagination

logger = logging.getLogger(__name__)


class ManagerLeaveViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet,
):
    """
    Manager leave request management ViewSet.

    Restricted exclusively to MANAGER and ADMIN roles (IsManager permission).
    Returns all employee leave requests with search, filtering, ordering, and pagination.
    """

    permission_classes = [IsManager]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = LeaveRequestFilter
    search_fields = [
        "employee__first_name",
        "employee__last_name",
        "employee__username",
        "employee__employee_id",
        "employee__email",
        "reason",
    ]
    ordering_fields = ["created_at", "start_date", "end_date", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Return all leave requests in the system."""
        return LeavesService.list_all_requests()

    def get_serializer_class(self):
        if self.action in ("approve", "reject"):
            return ApproveRejectSerializer
        return ManagerLeaveSerializer

    # ── list ──────────────────────────────────────────────

    def list(self, request, *args, **kwargs):
        """
        GET /api/v1/manager/leaves/

        List all leave requests across the organisation.
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = ManagerLeaveSerializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            return Response(
                {
                    "success": True,
                    "message": "Leave requests retrieved successfully.",
                    "data": paginated.data,
                },
                status=status.HTTP_200_OK,
            )

        serializer = ManagerLeaveSerializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Leave requests retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ── retrieve ──────────────────────────────────────────

    def retrieve(self, request, *args, **kwargs):
        """
        GET /api/v1/manager/leaves/{id}/

        Retrieve full detail of any leave request.
        """
        instance = self.get_object()
        serializer = ManagerLeaveSerializer(instance)
        return Response(
            {
                "success": True,
                "message": "Leave request detail retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ── approve ───────────────────────────────────────────

    @action(detail=True, methods=["patch"], url_path="approve")
    def approve(self, request, pk=None):
        """
        PATCH /api/v1/manager/leaves/{id}/approve/

        Approve a PENDING leave request.
        Only PENDING requests can be approved.
        """
        serializer = ApproveRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get("comment", "")

        try:
            updated = LeavesService.approve_leave(
                request_id=pk,
                reviewer=request.user,
                comment=comment,
            )
        except ServiceError as exc:
            return Response(
                {
                    "success": False,
                    "message": exc.message,
                    "errors": {"detail": exc.message},
                },
                status=exc.status_code,
            )

        output = ManagerLeaveSerializer(updated).data
        return Response(
            {
                "success": True,
                "message": "Leave request approved successfully.",
                "data": output,
            },
            status=status.HTTP_200_OK,
        )

    # ── reject ────────────────────────────────────────────

    @action(detail=True, methods=["patch"], url_path="reject")
    def reject(self, request, pk=None):
        """
        PATCH /api/v1/manager/leaves/{id}/reject/

        Reject a PENDING leave request.
        Only PENDING requests can be rejected.
        """
        serializer = ApproveRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get("comment", "")

        try:
            updated = LeavesService.reject_leave(
                request_id=pk,
                reviewer=request.user,
                comment=comment,
            )
        except ServiceError as exc:
            return Response(
                {
                    "success": False,
                    "message": exc.message,
                    "errors": {"detail": exc.message},
                },
                status=exc.status_code,
            )

        output = ManagerLeaveSerializer(updated).data
        return Response(
            {
                "success": True,
                "message": "Leave request rejected successfully.",
                "data": output,
            },
            status=status.HTTP_200_OK,
        )


class ManagerStatisticsView(APIView):
    """
    GET /api/v1/manager/statistics/

    Return aggregate employee leave statistics for managers.
    Restricted to MANAGER and ADMIN roles.
    """

    permission_classes = [IsManager]

    def get(self, request, *args, **kwargs):
        stats = LeavesService.manager_statistics()
        serializer = ManagerStatisticsSerializer(stats)
        return Response(
            {
                "success": True,
                "message": "Manager statistics retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
