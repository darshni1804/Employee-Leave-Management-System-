import { useEffect, useCallback, useState } from "react";
import { ClipboardCheck, Users } from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useManagerStats } from "@/features/manager/hooks/useManagerStats";
import { ManagerStatCards } from "@/features/manager/components/ManagerStatCards";
import { ManagerAnalytics } from "@/features/analytics/components/ManagerAnalytics";
import { PageHeader } from "@/components/shared/PageHeader";
import { managerService } from "@/features/manager/services/managerService";
import { getGreeting } from "@/lib/utils";
import type { LeaveRequest } from "@/types";

export function ManagerDashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading: isStatsLoading } = useManagerStats();
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAllLeaves = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const response = await managerService.getLeaveRequests({ page_size: 200, page: 1 });
      setAllLeaves(response.results);
    } catch {
      // Analytics data is non-critical; silently fail
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllLeaves();
  }, [fetchAllLeaves]);

  const displayName = user?.first_name || user?.name?.split(" ")[0] || "Manager";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        icon={ClipboardCheck}
        title="Manager Dashboard"
        subtitle={`${getGreeting()}, ${displayName}. Here's an overview of your team's leave metrics.`}
      />

      {/* Team Statistics Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-heading font-semibold text-lg text-foreground">
            Team Statistics
          </h2>
        </div>

        <ManagerStatCards stats={stats} isLoading={isStatsLoading} />
      </section>

      {/* Manager Analytics Section */}
      <ManagerAnalytics
        leaves={allLeaves}
        stats={stats}
        isLoading={analyticsLoading || isStatsLoading}
      />
    </div>
  );
}
