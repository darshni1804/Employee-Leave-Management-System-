import { useState } from "react";
import { X, Calendar, Check, Ban, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { managerService } from "@/features/manager/services/managerService";
import { toast } from "sonner";
import type { LeaveRequest } from "@/types";

interface ManagerLeaveDrawerProps {
  leave: LeaveRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAction?: "approve" | "reject" | null;
}

export function ManagerLeaveDrawer({
  leave,
  isOpen,
  onClose,
  onSuccess,
  initialAction = null,
}: ManagerLeaveDrawerProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAction, setActiveAction] = useState<"approve" | "reject" | null>(initialAction);

  // Sync initial action when opened
  if (isOpen && initialAction && activeAction !== initialAction) {
    setActiveAction(initialAction);
  }

  if (!leave) return null;

  const emp = leave.employee;
  const empName = emp?.name || (emp ? `${emp.first_name} ${emp.last_name}`.trim() : "Unknown");
  const empId = emp?.employee_id || "N/A";
  const dept = emp?.department || "N/A";
  const days = leave.duration_days ?? leave.total_days ?? 0;

  const handleSubmit = async (status: "APPROVED" | "REJECTED") => {
    setIsSubmitting(true);
    try {
      if (status === "APPROVED") {
        await managerService.approveLeave(leave.id, { comment });
      } else {
        await managerService.rejectLeave(leave.id, { comment });
      }
      toast.success(`Leave request ${status.toLowerCase()}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background">
          <h2 className="font-heading font-bold text-lg text-foreground">Leave Details</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Employee Info */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-lg font-bold text-white shadow-sm ring-4 ring-blue-50">
              {empName.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{empName}</h3>
              <p className="text-sm text-muted-foreground">{emp?.role} • {dept}</p>
              <p className="text-xs text-muted-foreground mt-0.5">ID: {empId}</p>
            </div>
          </div>

          <div className="h-px w-full bg-muted" />

          {/* Leave Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-background p-3 border border-border">
              <p className="text-xs text-muted-foreground font-medium mb-1">Leave Type</p>
              <p className="text-sm font-semibold text-foreground">
                {leave.leave_type?.name || "Leave"}
              </p>
            </div>
            <div className="rounded-xl bg-background p-3 border border-border">
              <p className="text-xs text-muted-foreground font-medium mb-1">Duration</p>
              <p className="text-sm font-semibold text-foreground">
                {days} {days === 1 ? "day" : "days"}
              </p>
            </div>
            <div className="col-span-2 rounded-xl bg-background p-3 border border-border">
              <p className="text-xs text-muted-foreground font-medium mb-1">Dates</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(leave.start_date)}
                <span className="text-muted-foreground font-normal mx-1">to</span>
                {formatDate(leave.end_date)}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Reason for Leave
            </p>
            <div className="rounded-xl bg-card border border-border p-4 text-sm text-muted-foreground leading-relaxed">
              {leave.reason || <span className="italic text-muted-foreground">No reason provided</span>}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Timeline
            </p>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E2E8F0] before:to-transparent ml-2">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#2563EB] text-white shadow shrink-0 -ml-1.5 z-10">
                  <Clock className="w-3 h-3" />
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:pr-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-foreground">Applied</span>
                    <span className="text-xs text-muted-foreground">{formatDate(leave.created_at)}</span>
                  </div>
                </div>
              </div>

              {leave.status !== "PENDING" && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mt-4">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-white text-white shadow shrink-0 -ml-1.5 z-10 ${leave.status === "APPROVED" ? "bg-emerald-500" : leave.status === "REJECTED" ? "bg-rose-500" : "bg-slate-500"}`}>
                    {leave.status === "APPROVED" ? <Check className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:pr-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-foreground">
                        {leave.status === "APPROVED" ? "Approved" : leave.status === "REJECTED" ? "Rejected" : "Cancelled"}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(leave.updated_at || leave.created_at)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background">
            <span className="text-sm font-semibold text-muted-foreground">Current Status</span>
            <StatusBadge status={leave.status} />
          </div>
          
          {/* Review Comment Display */}
          {leave.reviewer_comment && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Manager Comment
              </p>
              <div className="rounded-xl bg-background border border-border p-4 text-sm text-muted-foreground leading-relaxed">
                {leave.reviewer_comment}
              </div>
            </div>
          )}

          {/* Action Area (Only for Pending) */}
          {leave.status === "PENDING" && (
            <div className="pt-4 border-t border-border">
               <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveAction("approve")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors border ${activeAction === "approve" ? "bg-emerald-500 text-white border-emerald-600" : "bg-card text-muted-foreground border-border hover:bg-background"}`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAction("reject")}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors border ${activeAction === "reject" ? "bg-rose-500 text-white border-rose-600" : "bg-card text-muted-foreground border-border hover:bg-background"}`}
                  >
                    Reject
                  </button>
               </div>
               
               {activeAction && (
                 <div className="space-y-3 animate-in slide-in-from-top-2 fade-in">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Add a note (optional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={`Reason for ${activeAction === "approve" ? "approval" : "rejection"}...`}
                        className="w-full rounded-xl border border-border p-3 text-sm focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={() => handleSubmit(activeAction === "approve" ? "APPROVED" : "REJECTED")}
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 ${activeAction === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} disabled:opacity-50`}
                    >
                      {isSubmitting ? "Processing..." : `Confirm ${activeAction === "approve" ? "Approval" : "Rejection"}`}
                    </button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
