/**
 * Dashboard service — wraps dashboard API calls.
 */
import apiClient from "@/api/client";
import { DASHBOARD_ENDPOINTS } from "@/api/endpoints";
import type { DashboardData } from "@/types";

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const { data } = await apiClient.get<DashboardData>(
      DASHBOARD_ENDPOINTS.STATS
    );
    return data;
  },
};
