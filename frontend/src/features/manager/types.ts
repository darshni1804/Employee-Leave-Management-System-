/**
 * Manager feature types.
 */
import type { LeaveStatus, ManagerStatistics } from "@/types";

export type { ManagerStatistics };

export interface ManagerLeaveFilters {
  status?: LeaveStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface ReviewActionPayload {
  comment?: string;
}
