/**
 * Centralised API endpoint constants.
 *
 * All paths are relative to VITE_API_BASE_URL.
 * Never hardcode endpoint strings in components or services.
 */

// ─────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register/",
  LOGIN: "/auth/login/",
  LOGOUT: "/auth/logout/",
  TOKEN_REFRESH: "/auth/token/refresh/",
  TOKEN_VERIFY: "/auth/token/verify/",
  ME: "/auth/me/",
  ME_PROFILE: "/auth/me/profile/",
  ME_CHANGE_PASSWORD: "/auth/me/change-password/",
  USERS: "/auth/users/",
  USER_DETAIL: (id: number) => `/auth/users/${id}/`,
} as const;

// ─────────────────────────────────────────
// Leaves — Employee endpoints (Phase 2)
// Scoped to the authenticated employee's own leaves
// ─────────────────────────────────────────
export const EMPLOYEE_LEAVE_ENDPOINTS = {
  /** GET list / POST apply — /api/v1/leaves/ */
  LIST: "/leaves/",
  /** GET detail — /api/v1/leaves/{id}/ */
  DETAIL: (id: number) => `/leaves/${id}/`,
  /** PATCH cancel — /api/v1/leaves/{id}/cancel/ */
  CANCEL: (id: number) => `/leaves/${id}/cancel/`,
} as const;

// ─────────────────────────────────────────
// Leaves — Manager/Admin endpoints (Phase 3+)
// ─────────────────────────────────────────
export const LEAVE_ENDPOINTS = {
  TYPES: "/leaves/types/",
  TYPE_DETAIL: (id: number) => `/leaves/types/${id}/`,
  REQUESTS: "/leaves/requests/",
  REQUEST_DETAIL: (id: number) => `/leaves/requests/${id}/`,
  REQUEST_APPROVE: (id: number) => `/leaves/requests/${id}/approve/`,
  REQUEST_REJECT: (id: number) => `/leaves/requests/${id}/reject/`,
  REQUEST_CANCEL: (id: number) => `/leaves/requests/${id}/cancel/`,
  BALANCES: "/leaves/balances/",
  BALANCE_DETAIL: (id: number) => `/leaves/balances/${id}/`,
} as const;

// ─────────────────────────────────────────
// Leaves — Manager endpoints (Phase 4)
// Restricted to MANAGER and ADMIN roles
// ─────────────────────────────────────────
export const MANAGER_LEAVE_ENDPOINTS = {
  /** GET list — /api/v1/manager/leaves/ */
  LIST: "/manager/leaves/",
  /** GET detail — /api/v1/manager/leaves/{id}/ */
  DETAIL: (id: number) => `/manager/leaves/${id}/`,
  /** PATCH approve — /api/v1/manager/leaves/{id}/approve/ */
  APPROVE: (id: number) => `/manager/leaves/${id}/approve/`,
  /** PATCH reject — /api/v1/manager/leaves/{id}/reject/ */
  REJECT: (id: number) => `/manager/leaves/${id}/reject/`,
  /** GET statistics — /api/v1/manager/statistics/ */
  STATISTICS: "/manager/statistics/",
} as const;

// ─────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────
export const DASHBOARD_ENDPOINTS = {
  STATS: "/dashboard/stats/",
} as const;
