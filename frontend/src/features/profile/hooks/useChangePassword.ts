/**
 * useChangePassword — manages change-password form state and API call.
 */
import { useState, useCallback } from "react";
import { profileService } from "../services/profileService";
import type { ChangePasswordPayload } from "@/types";
import { getErrorMessage } from "@/lib/utils";

interface UseChangePasswordReturn {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  changePassword: (payload: ChangePasswordPayload) => Promise<boolean>;
  clearMessages: () => void;
}

export function useChangePassword(): UseChangePasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload): Promise<boolean> => {
      if (payload.new_password !== payload.new_password_confirm) {
        setError("New passwords do not match.");
        return false;
      }
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await profileService.changePassword(payload);
        setSuccessMessage("Password changed successfully. Please log in again if needed.");
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { isLoading, error, successMessage, changePassword, clearMessages };
}
