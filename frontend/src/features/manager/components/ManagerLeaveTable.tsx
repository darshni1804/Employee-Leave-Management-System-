/**
 * ManagerLeaveTable — responsive table for manager to review all employee leave requests.
 *
 * Columns:
 * - Employee (name, email)
 * - Employee ID
 * - Department
 * - Leave Dates (Start → End)
 * - Duration
 * - Reason
 * - Status badge
 * - Applied On
 * - Actions (Approve & Reject buttons visible ONLY for PENDING status)
 */
import { Calendar, Eye } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { LeaveRequest } from "@/types";

interface ManagerLeaveTableProps {
  leaves: LeaveRequest[];
  onViewDetails: (leave: LeaveRequest) => void;
}

export function ManagerLeaveTable({
  leaves,
  onViewDetails,
}: ManagerLeaveTableProps) {
  if (leaves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border bg-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
          <Calendar className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          No leave requests found
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No leave requests match your search query or selected filters.
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
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Emp ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Leave Dates
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Applied On
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaves.map((leave) => {
              const emp = leave.employee;
              const empName = emp?.name || (emp ? `${emp.first_name} ${emp.last_name}`.trim() : "Unknown");
              const empId = emp?.employee_id || "N/A";
              const dept = emp?.department || "N/A";
              const days = leave.duration_days ?? leave.total_days ?? 0;

              return (
                <tr key={leave.id} className="hover:bg-muted/30 transition-colors">
                  {/* Employee */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-foreground">{empName}</p>
                      <p className="text-xs text-muted-foreground">{emp?.email}</p>
                    </div>
                  </td>

                  {/* Emp ID */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-muted-foreground">
                    {empId}
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                    {dept}
                  </td>

                  {/* Leave Dates */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-medium text-foreground">
                      {formatDate(leave.start_date)}
                    </span>
                    <span className="text-muted-foreground mx-1">→</span>
                    <span className="text-muted-foreground">
                      {formatDate(leave.end_date)}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                    {days} {days === 1 ? "day" : "days"}
                  </td>

                  {/* Reason */}
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

                  {/* Status */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={leave.status} />
                  </td>

                  {/* Applied On */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(leave.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(leave)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-background transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </button>
                    </div>
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
