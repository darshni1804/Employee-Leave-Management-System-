/**
 * StatusBadge — color-coded badge for leave request status.
 *
 * Usage:
 *   <StatusBadge status="PENDING" />
 *   <StatusBadge status="APPROVED" />
 */
import { cn } from "@/lib/utils";
import type { LeaveStatus } from "@/types";

interface StatusBadgeProps {
  status: LeaveStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  LeaveStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400",
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-400/10 dark:text-red-400",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
