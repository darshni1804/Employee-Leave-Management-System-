/**
 * LeaveHistoryTable — responsive table for displaying employee leave requests.
 *
 * Columns: Start Date, End Date, Duration, Reason, Status, Actions
 * Features:
 * - Status badge
 * - Cancel button for PENDING leaves
 * - Empty state
 * - Mobile-responsive (horizontal scroll on small screens)
 */
import { Trash2, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { LeaveRequest } from "@/types";

interface LeaveHistoryTableProps {
  leaves: LeaveRequest[];
  onCancelClick: (leave: LeaveRequest) => void;
}

export function LeaveHistoryTable({
  leaves,
  onCancelClick,
}: LeaveHistoryTableProps) {
  if (leaves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Calendar className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          No leave requests found
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          You haven't applied for any leave yet, or no requests match your
          current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaves.map((leave) => {
              const days = leave.duration_days ?? leave.total_days ?? 0;
              return (
                <tr
                  key={leave.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3.5 whitespace-nowrap font-medium">
                    {formatDate(leave.start_date)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                    {formatDate(leave.end_date)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                    {days} {days === 1 ? "day" : "days"}
                  </td>
                  <td className="px-4 py-3.5 max-w-[180px]">
                    {leave.reason ? (
                      <span
                        className="block truncate text-foreground"
                        title={leave.reason}
                      >
                        {leave.reason}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">
                        No reason provided
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={leave.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {leave.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() => onCancelClick(leave)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                        aria-label={`Cancel leave request starting ${leave.start_date}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
