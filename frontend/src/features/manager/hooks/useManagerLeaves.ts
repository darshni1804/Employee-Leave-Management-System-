/**
 * useManagerLeaves — manages manager leave requests list with search,
 * filtering, pagination, and auto-refresh.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { managerService } from "../services/managerService";
import type { LeaveRequest, PaginatedResponse } from "@/types";
import type { ManagerLeaveFilters } from "../types";

interface UseManagerLeavesReturn {
  leaves: LeaveRequest[];
  pagination: Omit<PaginatedResponse<LeaveRequest>, "results"> | null;
  isLoading: boolean;
  error: string | null;
  filters: ManagerLeaveFilters;
  setFilters: (filters: Partial<ManagerLeaveFilters>) => void;
  refresh: () => void;
}

const DEFAULT_FILTERS: ManagerLeaveFilters = {
  page: 1,
  page_size: 10,
};

export function useManagerLeaves(): UseManagerLeavesReturn {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pagination, setPagination] = useState<Omit<
    PaginatedResponse<LeaveRequest>,
    "results"
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] =
    useState<ManagerLeaveFilters>(DEFAULT_FILTERS);

  const [refreshKey, setRefreshKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchLeaves = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, v]) => v !== "" && v !== undefined && v !== null
        )
      ) as ManagerLeaveFilters;

      const response = await managerService.getLeaveRequests(cleanFilters);
      setLeaves(response.results);
      const { results: _results, ...paginationMeta } = response;
      setPagination(paginationMeta);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "CanceledError") return;
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "Failed to load leave requests.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters, refreshKey]);

  useEffect(() => {
    fetchLeaves();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchLeaves]);

  const setFilters = useCallback((newFilters: Partial<ManagerLeaveFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      page: "page" in newFilters ? (newFilters.page ?? 1) : 1,
    }));
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { leaves, pagination, isLoading, error, filters, setFilters, refresh };
}
