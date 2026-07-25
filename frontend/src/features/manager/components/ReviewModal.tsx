/**
 * ReviewModal — modal dialog for approving or rejecting a leave request.
 *
 * Allows manager to add an optional comment/note before confirming.
 */
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { managerService } from "../services/managerService";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage, formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { LeaveRequest } from "@/types";

interface ReviewModalProps {
  leave: LeaveRequest | null;
  actionType: "approve" | "reject" | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({
  leave,
  actionType,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!leave || !actionType) return null;

  const isApprove = actionType === "approve";
  const empName = leave.employee?.name || leave.employee?.first_name || "Employee";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isApprove) {
        await managerService.approveLeave(leave.id, { comment });
        toast.success(
          "Leave approved",
          `Leave request for ${empName} has been approved.`
        );
      } else {
        await managerService.rejectLeave(leave.id, { comment });
        toast.success(
          "Leave rejected",
          `Leave request for ${empName} has been rejected.`
        );
      }
      setComment("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(
        `Failed to ${actionType} leave`,
        getErrorMessage(err)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={!!leave} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-card p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Close
            className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Close"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="flex items-start gap-3.5 mb-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isApprove
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              {isApprove ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <Dialog.Title className="text-base font-semibold capitalize">
                {actionType} Leave Request
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                {empName} ({formatDate(leave.start_date)} to {formatDate(leave.end_date)})
              </Dialog.Description>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reviewer_comment"
                className="block text-xs font-medium text-foreground mb-1.5"
              >
                Manager Comment <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <textarea
                id="reviewer_comment"
                rows={3}
                placeholder={
                  isApprove
                    ? "Add an optional approval note..."
                    : "Add an optional reason for rejection..."
                }
                value={comment}
                disabled={isSubmitting}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm disabled:opacity-50 ${
                  isApprove
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isSubmitting && <LoadingSpinner size="sm" />}
                <span className="capitalize">{actionType}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
