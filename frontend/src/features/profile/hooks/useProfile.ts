/**
 * useProfile — manages profile edit form state, submission, and error/success feedback.
 */
import { useState, useCallback } from "react";
import { profileService } from "../services/profileService";
import { useAuth } from "@/features/auth/store/AuthContext";
import type { UpdateProfilePayload } from "@/types";
import { getErrorMessage } from "@/lib/utils";

interface UseProfileReturn {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
  clearMessages: () => void;
}

export function useProfile(): UseProfileReturn {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      try {
        await profileService.updateProfile(payload);
        await refreshUser(); // Keep AuthContext.user in sync
        setSuccessMessage("Profile updated successfully.");
        return true;
      } catch (err) {
        setError(getErrorMessage(err));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshUser]
  );

  return { isLoading, error, successMessage, updateProfile, clearMessages };
}
