/**
 * useDashboardStats — fetches and computes leave statistics for the
 * Employee Dashboard.
 *
 * Calls the employee leaves list API (all leaves, no pagination limit)
 * and computes: remaining, approved, pending, rejected, cancelled counts.
 *
 * Usage:
 *   const { stats, recentLeaves, allLeaves, isLoading, error } = useDashboardStats();
 */
import { useState, useEffect } from "react";
import { employeeLeavesService } from "../services/employeeLeavesService";
import type { EmployeeLeaveStats, LeaveRequest } from "@/types";

const MAX_ANNUAL_LEAVE = 20;

interface UseDashboardStatsReturn {
  stats: EmployeeLeaveStats;
  recentLeaves: LeaveRequest[];
  allLeaves: LeaveRequest[];
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_STATS: EmployeeLeaveStats = {
  remaining: MAX_ANNUAL_LEAVE,
  approved: 0,
  pending: 0,
  cancelled: 0,
  rejected: 0,
};

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<EmployeeLeaveStats>(DEFAULT_STATS);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all leaves (high page_size to get complete picture)
        const response = await employeeLeavesService.getMyLeaves({
          page_size: 100,
          page: 1,
        });

        if (cancelled) return;

        const leaves = response.results;

        // Count by status
        const approved = leaves.filter((l) => l.status === "APPROVED").length;
        const pending = leaves.filter((l) => l.status === "PENDING").length;
        const cancelled_ = leaves.filter((l) => l.status === "CANCELLED").length;
        const rejected = leaves.filter((l) => l.status === "REJECTED").length;

        // Calculate used days from approved leaves this year
        const currentYear = new Date().getFullYear();
        const usedDays = leaves
          .filter(
            (l) =>
              l.status === "APPROVED" &&
              new Date(l.start_date).getFullYear() === currentYear
          )
          .reduce((sum, l) => sum + (l.duration_days ?? l.total_days ?? 0), 0);

        const remaining = Math.max(MAX_ANNUAL_LEAVE - usedDays, 0);

        setStats({ remaining, approved, pending, cancelled: cancelled_, rejected });
        setAllLeaves(leaves);

        // Keep 5 most recent for dashboard preview
        setRecentLeaves(leaves.slice(0, 5));
      } catch (err: unknown) {
        if (cancelled) return;
        const msg =
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response: { data: { message: string } } }).response.data
                .message
            : "Failed to load dashboard data.";
        setError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, recentLeaves, allLeaves, isLoading, error };
}
