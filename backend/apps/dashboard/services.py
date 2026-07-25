"""
Dashboard service layer.

Aggregates data from accounts and leaves apps.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from apps.accounts.models import User

logger = logging.getLogger(__name__)


class DashboardService:
    """
    Service class that computes dashboard statistics.

    All queries are read-only aggregations over accounts and leaves data.

    Usage::

        service = DashboardService()
        data = service.get_dashboard_data(user)
    """

    @staticmethod
    def get_dashboard_data(user: "User") -> dict:
        """
        Return the full dashboard payload scoped to the requesting user's role.

        - EMPLOYEE  : own stats only
        - MANAGER   : team stats
        - ADMIN     : company-wide stats

        TODO: Implement aggregation queries.
        """
        raise NotImplementedError("Implement get_dashboard_data()")

    @staticmethod
    def get_summary_stats(user: "User") -> dict:
        """
        Return counts: total_employees, pending, approved this month, etc.

        TODO: Implement DB aggregation.
        """
        raise NotImplementedError("Implement get_summary_stats()")

    @staticmethod
    def get_leave_type_distribution(user: "User") -> list[dict]:
        """
        Return per-leave-type breakdown for pie/bar charts.

        TODO: Implement GROUP BY leave_type query.
        """
        raise NotImplementedError("Implement get_leave_type_distribution()")

    @staticmethod
    def get_monthly_trends(user: "User", months: int = 6) -> list[dict]:
        """
        Return monthly approved/rejected/pending counts for the last N months.

        TODO: Implement time-series aggregation.
        """
        raise NotImplementedError("Implement get_monthly_trends()")
