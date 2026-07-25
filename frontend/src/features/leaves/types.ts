/**
 * Leaves feature types.
 * Re-exports global leave types and adds feature-local types.
 */
export type {
  LeaveType,
  LeaveRequest,
  LeaveBalance,
  LeaveStatus,
} from "@/types";

// ─────────────────────────────────────────
// Employee-facing (Phase 2) types
// ─────────────────────────────────────────

export interface ApplyLeavePayload {
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface EmployeeLeaveFilters {
  status?: import("@/types").LeaveStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

// ─────────────────────────────────────────
// Manager/Admin (Phase 3+) types
// ─────────────────────────────────────────

export interface CreateLeaveRequestPayload {
  leave_type: number;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface ReviewLeaveRequestPayload {
  comment?: string;
}

export interface LeaveRequestFilters {
  status?: import("@/types").LeaveStatus;
  leave_type?: number;
  start_date?: string;
  end_date?: string;
  employee?: number;
  page?: number;
  page_size?: number;
}
