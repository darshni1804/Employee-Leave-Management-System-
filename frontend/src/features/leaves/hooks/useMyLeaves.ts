/**
 * useMyLeaves — manages the employee's leave list with pagination,
 * filtering, and search.
 *
 * Usage:
 *   const { leaves, pagination, isLoading, error, filters, setFilters, refresh } = useMyLeaves();
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { employeeLeavesService } from "../services/employeeLeavesService";
import type { LeaveRequest, PaginatedResponse } from "@/types";
import type { EmployeeLeaveFilters } from "../types";

interface UseMyLeavesReturn {
  leaves: LeaveRequest[];
  pagination: Omit<PaginatedResponse<LeaveRequest>, "results"> | null;
  isLoading: boolean;
  error: string | null;
  filters: EmployeeLeaveFilters;
  setFilters: (filters: Partial<EmployeeLeaveFilters>) => void;
  refresh: () => void;
}

const DEFAULT_FILTERS: EmployeeLeaveFilters = {
  page: 1,
  page_size: 10,
};

export function useMyLeaves(): UseMyLeavesReturn {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [pagination, setPagination] = useState<Omit<
    PaginatedResponse<LeaveRequest>,
    "results"
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] =
    useState<EmployeeLeaveFilters>(DEFAULT_FILTERS);

  // Refresh counter to trigger re-fetch without changing filters
  const [refreshKey, setRefreshKey] = useState(0);

  // Abort controller ref to cancel in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  const fetchLeaves = useCallback(async () => {
    // Cancel any previous in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Strip empty strings from filters before sending
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, v]) => v !== "" && v !== undefined && v !== null
        )
      ) as EmployeeLeaveFilters;

      const response = await employeeLeavesService.getMyLeaves(cleanFilters);
      setLeaves(response.results);
      const { results: _results, ...paginationMeta } = response;
      setPagination(paginationMeta);
    } catch (err: unknown) {
      // Ignore aborted requests
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
  }, [filters, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchLeaves();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchLeaves]);

  const setFilters = useCallback((newFilters: Partial<EmployeeLeaveFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (not when page itself changes)
      page:
        "page" in newFilters ? (newFilters.page ?? 1) : 1,
    }));
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { leaves, pagination, isLoading, error, filters, setFilters, refresh };
}
