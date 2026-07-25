/**
 * useToast — thin wrapper around sonner's toast utility.
 *
 * Provides typed helpers: toast.success(), toast.error(), toast.info(), toast.loading()
 *
 * Usage:
 *   const { toast } = useToast();
 *   toast.success("Leave request submitted!");
 */
import { toast as sonnerToast } from "sonner";

interface ToastHelpers {
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  loading: (message: string) => string | number;
  dismiss: (id?: string | number) => void;
}

export function useToast(): { toast: ToastHelpers } {
  const toast: ToastHelpers = {
    success: (message, description) =>
      sonnerToast.success(message, { description }),

    error: (message, description) =>
      sonnerToast.error(message, { description }),

    info: (message, description) =>
      sonnerToast.info(message, { description }),

    warning: (message, description) =>
      sonnerToast.warning(message, { description }),

    loading: (message) => sonnerToast.loading(message),

    dismiss: (id) => sonnerToast.dismiss(id),
  };

  return { toast };
}
