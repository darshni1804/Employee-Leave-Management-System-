"""
Leaves django-filter FilterSets.
"""
import django_filters

from apps.leaves.models import LeaveRequest, LeaveStatus


class LeaveRequestFilter(django_filters.FilterSet):
    """
    FilterSet for leave requests.

    Query params:
    - status       : Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
    - leave_type   : Filter by leave type ID
    - start_date   : Filter requests starting on or after this date
    - end_date     : Filter requests ending on or before this date
    - employee     : Filter by employee ID (manager/admin only)
    """

    status = django_filters.ChoiceFilter(choices=LeaveStatus.choices)
    start_date = django_filters.DateFilter(field_name="start_date", lookup_expr="gte")
    end_date = django_filters.DateFilter(field_name="end_date", lookup_expr="lte")
    leave_type = django_filters.NumberFilter(field_name="leave_type__id")
    employee = django_filters.NumberFilter(field_name="employee__id")

    class Meta:
        model = LeaveRequest
        fields = ["status", "leave_type", "start_date", "end_date", "employee"]
