/**
 * ManagerStatCards — stat cards display for the Manager Dashboard.
 *
 * Cards:
 * - Pending Requests (amber)
 * - Approved Today (emerald)
 * - Total Employees (indigo)
 * - Approved Total (blue)
 * - Rejected Total (rose)
 * - Cancelled Total (slate)
 */
import {
  Users,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import type { ManagerStatistics } from "@/types";
import { SkeletonCard } from "@/components/ui/Skeleton";

interface ManagerStatCardsProps {
  stats: ManagerStatistics | null;
  isLoading: boolean;
}

export function ManagerStatCards({ stats, isLoading }: ManagerStatCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Pending Requests",
      value: stats.pending_requests,
      icon: Clock,
      iconBg: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      subLabel: "Awaiting approval decision",
    },
    {
      label: "Approved Today",
      value: stats.approved_today,
      icon: CalendarCheck,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      subLabel: "Leaves approved today",
    },
    {
      label: "Total Employees",
      value: stats.total_employees,
      icon: Users,
      iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      subLabel: "Active team members",
    },
    {
      label: "Approved Total",
      value: stats.approved_total,
      icon: CheckCircle2,
      iconBg: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      subLabel: "Total approved all-time",
    },
    {
      label: "Rejected Total",
      value: stats.rejected_total,
      icon: XCircle,
      iconBg: "bg-rose-50 dark:bg-rose-950/30",
      iconColor: "text-rose-600 dark:text-rose-400",
      subLabel: "Total rejected all-time",
    },
    {
      label: "Cancelled Total",
      value: stats.cancelled_total,
      icon: Ban,
      iconBg: "bg-slate-100 dark:bg-slate-800/40",
      iconColor: "text-slate-600 dark:text-slate-400",
      subLabel: "Cancelled by employee",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold tracking-tight">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.subLabel}</p>
          </div>
        );
      })}
    </div>
  );
}
