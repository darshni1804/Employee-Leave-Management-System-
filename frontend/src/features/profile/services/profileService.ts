/**
 * Profile service — wraps API calls for profile management.
 *
 * PATCH /api/v1/auth/me/profile/    → update own profile fields
 * POST  /api/v1/auth/me/change-password/ → change own password
 */
import apiClient from "@/api/client";
import { AUTH_ENDPOINTS } from "@/api/endpoints";
import type { User, ApiResponse, UpdateProfilePayload, ChangePasswordPayload } from "@/types";

export const profileService = {
  /**
   * Update current user's profile (name, phone, department, photo).
   * Sends as multipart if a File is included, otherwise JSON.
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    let body: UpdateProfilePayload | FormData = payload;
    let headers: Record<string, string> = {};

    if (payload.profile_picture instanceof File) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, value as string | Blob);
        }
      });
      body = form;
      // Let axios set multipart content-type with boundary automatically
    } else {
      headers["Content-Type"] = "application/json";
    }

    const { data } = await apiClient.patch<ApiResponse<User>>(
      AUTH_ENDPOINTS.ME_PROFILE,
      body,
      { headers }
    );
    return data.data;
  },

  /**
   * Change current user's password.
   */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.ME_CHANGE_PASSWORD, payload);
  },
};
