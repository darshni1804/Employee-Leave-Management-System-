/**
 * Global TypeScript type definitions.
 *
 * Domain types shared across multiple features.
 */

// ─────────────────────────────────────────
// Common API envelope
// ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: T[];
}

/** Paginated response nested inside an API envelope */
export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: PaginatedResponse<T>;
}

export interface ApiError {
  success: false;
  message: string;
  errors: Record<string, string | string[]>;
}

// ─────────────────────────────────────────
// User / Auth
// ─────────────────────────────────────────
export type UserRole = "EMPLOYEE" | "MANAGER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  employee_id: string | null;
  department: string;
  phone_number?: string;
  profile_picture?: string | null;
  manager?: number | null;
  manager_name?: string | null;
  date_of_joining?: string | null;
  is_active: boolean;
  date_joined: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthSuccessPayload {
  access: string;
  refresh: string;
  user: User;
}

// ─────────────────────────────────────────
// Leave Types
// ─────────────────────────────────────────
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveType {
  id: number;
  name: string;
  description: string;
  max_days_per_year: number;
  requires_approval: boolean;
  is_paid: boolean;
  is_active: boolean;
}

/**
 * LeaveRequest — unified type covering both the employee list/detail
 * responses (Phase 2) and the manager responses (Phase 3).
 *
 * Phase 2 LeaveListSerializer  → uses `duration_days`, no nested employee/leave_type
 * Phase 2 LeaveDetailSerializer → uses `duration_days`, nested employee (no leave_type)
 * Manager serializer           → uses `total_days`, nested employee + leave_type
 */
export interface LeaveRequest {
  id: number;
  /** Present in detail and manager views; absent in compact list */
  employee?: User | null;
  /** Nullable — Phase 2 employee submissions have no leave type */
  leave_type?: LeaveType | null;
  start_date: string;
  end_date: string;
  /** Returned by manager serializer */
  total_days?: number;
  /** Returned by Phase 2 employee serializers */
  duration_days?: number;
  reason: string;
  status: LeaveStatus;
  status_display: string;
  reviewed_by?: User | null;
  reviewer_comment?: string;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface LeaveBalance {
  id: number;
  leave_type: LeaveType;
  year: number;
  allocated_days: number;
  used_days: number;
  remaining_days: number;
}

// ─────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────
export interface DashboardSummary {
  total_employees: number;
  pending_requests: number;
  approved_this_month: number;
  rejected_this_month: number;
  employees_on_leave_today: number;
}

export interface LeaveTypeDistribution {
  leave_type: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  leave_type_distribution: LeaveTypeDistribution[];
  monthly_trends: MonthlyTrend[];
}

// ─────────────────────────────────────────
// Employee dashboard stats (computed client-side)
// ─────────────────────────────────────────
export interface EmployeeLeaveStats {
  remaining: number;
  approved: number;
  pending: number;
  cancelled: number;
  rejected: number;
}

// ─────────────────────────────────────────
// Manager statistics (Phase 4 API payload)
// ─────────────────────────────────────────
export interface ManagerStatistics {
  total_employees: number;
  pending_requests: number;
  approved_today: number;
  approved_total: number;
  rejected_total: number;
  cancelled_total: number;
}

// ─────────────────────────────────────────
// Profile update payload
// ─────────────────────────────────────────
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  department?: string;
  profile_picture?: File | null;
}

// ─────────────────────────────────────────
// Change password payload
// ─────────────────────────────────────────
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}
