/**
 * CancelLeaveDialog — confirmation dialog for cancelling a leave request.
 *
 * Wraps the reusable ConfirmDialog with cancel-leave specific
 * messaging and API call.
 *
 * Usage:
 *   <CancelLeaveDialog
 *     leave={selectedLeave}
 *     onClose={() => setSelected(null)}
 *     onSuccess={refresh}
 *   />
 */
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { employeeLeavesService } from "../services/employeeLeavesService";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage, formatDate } from "@/lib/utils";
import type { LeaveRequest } from "@/types";

interface CancelLeaveDialogProps {
  leave: LeaveRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CancelLeaveDialog({
  leave,
  onClose,
  onSuccess,
}: CancelLeaveDialogProps) {
  const { toast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirm = async () => {
    if (!leave) return;
    setIsCancelling(true);
    try {
      await employeeLeavesService.cancelLeave(leave.id);
      toast.success("Leave cancelled", "Your leave request has been cancelled.");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error("Could not cancel leave", getErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  const description = leave
    ? `This will cancel your leave request from ${formatDate(leave.start_date)} to ${formatDate(leave.end_date)}. This action cannot be undone.`
    : undefined;

  return (
    <ConfirmDialog
      open={!!leave}
      title="Cancel Leave Request"
      description={description}
      confirmLabel="Yes, cancel it"
      cancelLabel="Keep it"
      variant="destructive"
      isLoading={isCancelling}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
