/**
 * DashboardPage — Employee Dashboard.
 *
 * Displays:
 * - 3 stat cards: Remaining Leave, Approved Leaves, Pending Leaves
 * - Skeleton loading state
 * - Recent leave activity (last 5 requests)
 * - Quick-action "Apply for Leave" button
 */
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX2,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useDashboardStats } from "@/features/leaves/hooks/useDashboardStats";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SkeletonCard, Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";

// ─────────────────────────────────────────
// Stat card config
// ─────────────────────────────────────────
interface StatCard {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
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

  const displayName = user?.first_name || user?.name || "there";

  const statCards: StatCard[] = [
    {
      label: "Remaining Leave",
      value: stats.remaining,
      icon: CalendarCheck,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      subLabel: "days available this year",
    },
    {
      label: "Approved Leaves",
      value: stats.approved,
      icon: CalendarClock,
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      subLabel: "requests approved",
    },
    {
      label: "Pending Leaves",
      value: stats.pending,
      icon: CalendarX2,
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      subLabel: "awaiting approval",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ── Welcome banner ───────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, {displayName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here's a summary of your leave activity.
          </p>
        </div>
        <button
          onClick={() => navigate("/leaves")}
          className="flex items-center gap-2 self-start sm:self-auto rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Apply for Leave
        </button>
      </div>

      {/* ── Error state ──────────────────────── */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ── Stat cards ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card) => (
              <StatCardItem key={card.label} card={card} />
            ))}
      </div>

      {/* ── Recent Activity ──────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Recent Leave Activity</h2>
          </div>
          <button
            onClick={() => navigate("/leaves")}
            className="text-xs text-primary hover:underline font-medium"
          >
            View all →
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border bg-card divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5">
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border bg-card text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">No leave history yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Apply for leave to see your activity here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm divide-y divide-border">
            {recentLeaves.map((leave) => {
              const days = leave.duration_days ?? leave.total_days ?? 0;
              return (
                <div
                  key={leave.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(leave.start_date)}{" "}
                      <span className="text-muted-foreground font-normal">→</span>{" "}
                      {formatDate(leave.end_date)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
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

// ─────────────────────────────────────────
// Sub-component: individual stat card
// ─────────────────────────────────────────
function StatCardItem({ card }: { card: StatCard }) {
  const Icon = card.icon;
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
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
}
