/**
 * DashboardPage — Employee Dashboard matching Reference Image 3 design system.
 */
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CalendarClock,
  Clock,
  PlusCircle,
  TrendingUp,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useDashboardStats } from "@/features/leaves/hooks/useDashboardStats";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";

interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  subLabel: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, recentLeaves, isLoading, error } = useDashboardStats();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.first_name || user?.name?.split(" ")[0] || "there";

  const statCards: StatCard[] = [
    {
      label: "Remaining Leave",
      value: stats.remaining,
      icon: CalendarCheck,
      iconBg: "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]/60",
      subLabel: "days available this year",
    },
    {
      label: "Approved Leaves",
      value: stats.approved,
      icon: CalendarClock,
      iconBg: "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]/60",
      subLabel: "requests approved",
    },
    {
      label: "Pending Leaves",
      value: stats.pending,
      icon: Clock,
      iconBg: "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]/60",
      subLabel: "awaiting approval",
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner / Header */}
      <PageHeader
        icon={LayoutDashboard}
        title={`${greeting()}, ${displayName}`}
        subtitle="Here's a summary of your leave activity and remaining balances."
        action={
          <button
            onClick={() => navigate("/leaves")}
            className="flex items-center gap-2 rounded-xl bg-[#FF6A00] px-5 py-3 font-sans text-sm font-semibold text-white shadow-xs hover:bg-[#FF8533] transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Apply for Leave
          </button>
        }
      />

      {/* Error notification */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-[18px] border border-[#E5E7EB] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-180"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="font-sans text-sm font-semibold text-[#475569]">
                    {card.label}
                  </p>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
                  >
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="font-mono text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
                  {card.value}
                </p>
                <p className="font-sans text-xs text-[#64748B] mt-1.5">
                  {card.subLabel}
                </p>
              </div>
            ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-5 w-5 text-[#475569]" />
            <h2 className="font-heading font-bold text-lg text-[#111827]">
              Recent Leave Activity
            </h2>
          </div>
          <button
            onClick={() => navigate("/leaves")}
            className="font-sans text-xs font-semibold text-[#2563EB] hover:underline"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white divide-y divide-[#E5E7EB]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-[18px] border border-[#E5E7EB] bg-white text-center">
            <CalendarClock className="h-10 w-10 text-[#94A3B8] mb-3" />
            <p className="font-sans text-base font-semibold text-[#111827]">
              No leave history yet
            </p>
            <p className="font-sans text-xs text-[#64748B] mt-1">
              Submit your first leave request to see your activity here.
            </p>
          </div>
        ) : (
          <div className="rounded-[18px] border border-[#E5E7EB] bg-white overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] divide-y divide-[#E5E7EB]">
            {recentLeaves.map((leave) => {
              const days = leave.duration_days ?? leave.total_days ?? 0;
              return (
                <div
                  key={leave.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div>
                    <p className="font-sans text-sm font-semibold text-[#111827]">
                      {formatDate(leave.start_date)}{" "}
                      <span className="text-[#94A3B8] font-normal mx-1">→</span>{" "}
                      {formatDate(leave.end_date)}
                    </p>
                    <p className="font-sans text-xs text-[#64748B] mt-1">
                      {days} {days === 1 ? "day" : "days"}
                      {leave.reason ? ` · ${leave.reason}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
