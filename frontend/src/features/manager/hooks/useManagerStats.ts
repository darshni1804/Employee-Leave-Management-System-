/**
 * useManagerStats — fetches manager statistics from GET /api/v1/manager/statistics/.
 */
import { useState, useEffect, useCallback } from "react";
import { managerService } from "../services/managerService";
import type { ManagerStatistics } from "@/types";

interface UseManagerStatsReturn {
  stats: ManagerStatistics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useManagerStats(): UseManagerStatsReturn {
  const [stats, setStats] = useState<ManagerStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await managerService.getStatistics();
      setStats(data);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "Failed to load manager statistics.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { stats, isLoading, error, refresh };
}
