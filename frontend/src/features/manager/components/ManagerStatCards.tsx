/**
 * ManagerStatCards — stat cards for Manager Dashboard matching Reference Image 3.
 *
 * Card Spec:
 * - White background, 18px radius, #E5E7EB border, soft shadow, 24px padding
 * - Card title: Inter font
 * - Large number: JetBrains Mono font
 * - Icon: inside small rounded square on top right
 */
import {
  Clock,
  CheckCircle2,
  Users,
  CalendarCheck,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
      iconBg: "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]/60",
      subLabel: "Awaiting approval decision",
    },
    {
      label: "Approved Leaves",
      value: stats.approved_today,
      icon: CheckCircle2,
      iconBg: "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]/60",
      subLabel: "Leaves approved this month",
    },
    {
      label: "Total Employees",
      value: stats.total_employees,
      icon: Users,
      iconBg: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]/60",
      subLabel: "Active team members",
    },
    {
      label: "Approved Total",
      value: stats.approved_total,
      icon: CalendarCheck,
      iconBg: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]/60",
      subLabel: "Total approved requests",
    },
    {
      label: "Rejected Total",
      value: stats.rejected_total,
      icon: XCircle,
      iconBg: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]/60",
      subLabel: "Total rejected requests",
    },
    {
      label: "Cancelled Total",
      value: stats.cancelled_total,
      icon: Ban,
      iconBg: "bg-background text-muted-foreground border border-[#E2E8F0]",
      subLabel: "Cancelled by employee",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-[18px] border border-border bg-card p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-180"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="font-sans text-sm font-semibold text-muted-foreground">
                {card.label}
              </p>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              {card.value}
            </p>
            <p className="font-sans text-xs text-muted-foreground mt-1.5">
              {card.subLabel}
            </p>
          </div>
        );
      })}
    </div>
  );
}
