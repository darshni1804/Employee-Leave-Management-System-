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

export interface LeaveRequest {
  id: number;
  employee: User;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: LeaveStatus;
  status_display: string;
  reviewed_by: User | null;
  reviewer_comment: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
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
