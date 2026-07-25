/**
 * Auth service — wraps API calls for authentication.
 *
 * All auth-related HTTP requests live here.
 * Components and hooks call this service, not apiClient directly.
 */
import apiClient from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import type { User, AuthSuccessPayload, ApiResponse } from "@/types";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validations";

export const authService = {
  /**
   * Log in and return access token, refresh token, and user info.
   */
  async login(credentials: LoginFormValues): Promise<AuthSuccessPayload> {
    const { data } = await apiClient.post<ApiResponse<AuthSuccessPayload> | AuthSuccessPayload>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );

    if ("data" in data && data.data && typeof data.data === "object" && "access" in data.data) {
      return data.data;
    }
    return data as AuthSuccessPayload;
  },

  /**
   * Register a new user account.
   */
  async register(payload: RegisterFormValues): Promise<User> {
    const { data } = await apiClient.post<ApiResponse<User> | User>(
      AUTH_ENDPOINTS.REGISTER,
      payload
    );

    if ("data" in data && data.data && typeof data.data === "object" && "id" in data.data) {
      return data.data;
    }
    return data as User;
  },

  /**
   * Fetch the currently authenticated user.
   */
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiResponse<User> | User>(AUTH_ENDPOINTS.ME);

    if ("data" in data && data.data && typeof data.data === "object" && "id" in data.data) {
      return data.data;
    }
    return data as User;
  },

  /**
   * Refresh the access token using the refresh token.
   */
  async refreshToken(refreshTokenStr: string): Promise<{ access: string }> {
    const { data } = await apiClient.post<ApiResponse<{ access: string }> | { access: string }>(
      AUTH_ENDPOINTS.TOKEN_REFRESH,
      { refresh: refreshTokenStr }
    );

    if ("data" in data && data.data && typeof data.data === "object" && "access" in data.data) {
      return data.data;
    }
    return data as { access: string };
  },

  /**
   * Log out — invalidates refresh token on backend.
   */
  async logout(refreshTokenStr?: string | null): Promise<void> {
    if (refreshTokenStr) {
      try {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT, { refresh: refreshTokenStr });
      } catch (err) {
        console.warn("Backend logout warning:", err);
      }
    }
  },
};
