"""
Dashboard serializers.
"""
from rest_framework import serializers


class LeaveStatsSummarySerializer(serializers.Serializer):
    """Summary statistics for the dashboard."""

    total_employees = serializers.IntegerField()
    pending_requests = serializers.IntegerField()
    approved_this_month = serializers.IntegerField()
    rejected_this_month = serializers.IntegerField()
    employees_on_leave_today = serializers.IntegerField()


class LeaveTypeDistributionSerializer(serializers.Serializer):
    """Per-leave-type breakdown."""

    leave_type = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()


class MonthlyTrendSerializer(serializers.Serializer):
    """Monthly leave request trends."""

    month = serializers.CharField()
    approved = serializers.IntegerField()
    rejected = serializers.IntegerField()
    pending = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    """Complete dashboard payload."""

    summary = LeaveStatsSummarySerializer()
    leave_type_distribution = LeaveTypeDistributionSerializer(many=True)
    monthly_trends = MonthlyTrendSerializer(many=True)
