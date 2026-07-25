"""
Leaves views — DRF ViewSets.

Separation of concerns:
    - Views handle only HTTP request/response lifecycle.
    - All business logic is delegated to ``LeavesService``.

Endpoints:
    Employee-facing (LeaveViewSet):
        GET    /api/v1/leaves/              List own leave requests
        POST   /api/v1/leaves/              Apply for leave
        GET    /api/v1/leaves/{id}/         Retrieve own leave detail
        PATCH  /api/v1/leaves/{id}/cancel/  Cancel a pending leave

    Manager/Admin (legacy — Phase 3):
        LeaveRequestViewSet under /api/v1/leaves/requests/
        LeaveTypeViewSet     under /api/v1/leaves/types/
        LeaveBalanceViewSet  under /api/v1/leaves/balances/
"""
import logging

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from apps.leaves.filters import LeaveRequestFilter
from apps.leaves.models import LeaveBalance, LeaveRequest, LeaveType
from apps.leaves.permissions import IsEmployeeOnly, IsLeaveOwner
from apps.leaves.serializers import (
    CancelLeaveSerializer,
    CreateLeaveRequestSerializer,
    LeaveBalanceSerializer,
    LeaveCreateSerializer,
    LeaveDetailSerializer,
    LeaveListSerializer,
    LeaveRequestSerializer,
    LeaveTypeSerializer,
    ReviewLeaveRequestSerializer,
)
from apps.leaves.services import LeavesService
from core.exceptions import ServiceError
from core.pagination import StandardResultsPagination

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────
# Phase 2 — Employee-Facing ViewSet
# ──────────────────────────────────────────────────────────

class LeaveViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    GenericViewSet,
):
    """
    Employee leave management ViewSet.

    Only authenticated users with the EMPLOYEE role can access these endpoints.
    All data is automatically scoped to the requesting user — employees cannot
    see each other's leave records.

    Supports:
        - Filtering by status, start_date, end_date (django-filter)
        - Search by reason, status (DRF SearchFilter)
        - Pagination via StandardResultsPagination
    """

    permission_classes = [IsEmployeeOnly, IsLeaveOwner]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = LeaveRequestFilter
    search_fields = ["reason", "status"]

    def get_queryset(self):
        """Return only the authenticated employee's leave requests."""
        return LeavesService.list_employee_leaves(self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return LeaveCreateSerializer
        if self.action == "cancel":
            return CancelLeaveSerializer
        if self.action == "retrieve":
            return LeaveDetailSerializer
        return LeaveListSerializer

    # ── list ──────────────────────────────────────────────

    def list(self, request, *args, **kwargs):
        """
        GET /api/v1/leaves/

        Return the authenticated employee's leave history with pagination,
        filtering, and search support.

        Query parameters:
            status          Filter by status (PENDING|APPROVED|REJECTED|CANCELLED)
            start_date      Filter by start_date >= value (YYYY-MM-DD)
            end_date        Filter by end_date <= value (YYYY-MM-DD)
            search          Full-text search on reason or status
            page            Page number (default: 1)
            page_size       Results per page (default: 20, max: 100)
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated = self.get_paginated_response(serializer.data)
            return Response(
                {
                    "success": True,
                    "message": "Leave history retrieved successfully.",
                    "data": paginated.data,
                },
                status=status.HTTP_200_OK,
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Leave history retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ── retrieve ──────────────────────────────────────────

    def retrieve(self, request, *args, **kwargs):
        """
        GET /api/v1/leaves/{id}/

        Return the full detail of a single leave request.
        Only the owning employee can access this endpoint.
        """
        instance = self.get_object()  # triggers IsLeaveOwner object-level check
        serializer = self.get_serializer(instance)
        return Response(
            {
                "success": True,
                "message": "Leave request retrieved successfully.",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ── create ────────────────────────────────────────────

    def create(self, request, *args, **kwargs):
        """
        POST /api/v1/leaves/

        Apply for leave.

        Request body:
            start_date  (YYYY-MM-DD, required)
            end_date    (YYYY-MM-DD, required)
            reason      (string, optional)

        Business rules enforced:
            Rule 1 — Annual limit (20 days / calendar year)
            Rule 2 — No past dates
            Rule 3 — end_date >= start_date
            Rule 4 — No overlap with approved leave
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            leave_request = LeavesService.submit_leave(
                employee=request.user,
                validated_data=serializer.validated_data,
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

        output = LeaveDetailSerializer(leave_request).data
        return Response(
            {
                "success": True,
                "message": "Leave request submitted successfully.",
                "data": output,
            },
            status=status.HTTP_201_CREATED,
        )

    # ── cancel ────────────────────────────────────────────

    @action(detail=True, methods=["patch"], url_path="cancel")
    def cancel(self, request, pk=None):
        """
        PATCH /api/v1/leaves/{id}/cancel/

        Cancel a PENDING leave request.

        No request body required.
        Only the owning employee can cancel; only PENDING status can be cancelled.
        """
        # Fetch and check object-level ownership
        instance = self.get_object()  # triggers IsLeaveOwner

        try:
            updated = LeavesService.cancel_leave(
                request_id=instance.pk,
                employee=request.user,
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

        output = LeaveDetailSerializer(updated).data
        return Response(
            {
                "success": True,
                "message": "Leave request cancelled successfully.",
                "data": output,
            },
            status=status.HTTP_200_OK,
        )


# ──────────────────────────────────────────────────────────
# Legacy ViewSets — Manager / Admin Phase 3
# ──────────────────────────────────────────────────────────

class LeaveTypeViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    GenericViewSet,
):
    """
    CRUD for leave types (Admin only — Phase 3).
    """

    serializer_class = LeaveTypeSerializer
    queryset = LeaveType.objects.all()


class LeaveRequestViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet,
):
    """
    Manager-facing leave request management (Phase 3).
    """

    queryset = LeaveRequest.objects.all().select_related("employee")
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = LeaveRequestFilter
    search_fields = ["reason", "status"]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateLeaveRequestSerializer
        if self.action in ("approve", "reject"):
            return ReviewLeaveRequestSerializer
        return LeaveRequestSerializer

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return Response(
            {"success": True, "message": "Leave request approved.", "data": {}},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return Response(
            {"success": True, "message": "Leave request rejected.", "data": {}},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        return Response(
            {"success": True, "message": "Leave request cancelled.", "data": {}},
            status=status.HTTP_200_OK,
        )


class LeaveBalanceViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    GenericViewSet,
):
    """
    Leave balance views (Phase 3).
    """

    serializer_class = LeaveBalanceSerializer
    queryset = LeaveBalance.objects.all().select_related("employee", "leave_type")
