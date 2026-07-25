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
// Leaves
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
// Dashboard
// ─────────────────────────────────────────
export const DASHBOARD_ENDPOINTS = {
  STATS: "/dashboard/stats/",
} as const;
