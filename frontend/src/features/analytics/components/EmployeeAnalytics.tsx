/**
 * EmployeeAnalytics — Analytics section embedded in the Employee Dashboard.
 *
 * Data sources:
 *  - Leave list from employeeLeavesService (all leaves, no pagination limit)
 *  - Derived client-side: monthly trends, status distribution, balance progress
 *
 * Charts:
 *  1. Leave Status Distribution (Donut)
 *  2. Monthly Leave Trend (Line)
 *  3. Leave Usage (Bar)
 *  4. Leave Balance Progress Ring (SVG)
 *  5. Quick Insights panel
 */
import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TrendingUp, Target, Calendar, Clock, CheckCircle2, BarChart2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LeaveRequest, EmployeeLeaveStats } from "@/types";

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const MAX_ANNUAL_LEAVE = 20;

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#16A34A",
  PENDING: "#D97706",
  REJECTED: "#DC2626",
  CANCELLED: "#94A3B8",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─────────────────────────────────────────
// Chart card wrapper
// ─────────────────────────────────────────
function ChartCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-heading font-semibold text-sm text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// Leave Balance Ring
// ─────────────────────────────────────────
function BalanceRing({ used, total }: { used: number; total: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(used / total, 1);
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width={130} height={130} viewBox="0 0 130 130" className="-rotate-90">
        <circle cx={65} cy={65} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={10} />
        <circle
          cx={65}
          cy={65}
          r={radius}
          fill="none"
          stroke="#2563EB"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-3xl font-bold text-foreground">{total - used}</span>
        <span className="text-xs text-muted-foreground font-medium">remaining</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
interface EmployeeAnalyticsProps {
  leaves: LeaveRequest[];
  stats: EmployeeLeaveStats;
  isLoading: boolean;
}

export function EmployeeAnalytics({ leaves, stats, isLoading }: EmployeeAnalyticsProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // ── Status distribution (donut) ──
  const statusData = useMemo(() => {
    const counts = { APPROVED: 0, PENDING: 0, REJECTED: 0, CANCELLED: 0 };
    leaves.forEach((l) => {
      if (l.status in counts) counts[l.status as keyof typeof counts]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [leaves]);

  // ── Monthly leave trend (line chart) ──
  const monthlyData = useMemo(() => {
    const map: Record<number, { approved: number; rejected: number; pending: number }> = {};
    for (let m = 0; m < 12; m++) map[m] = { approved: 0, rejected: 0, pending: 0 };

    leaves.forEach((l) => {
      const m = new Date(l.start_date).getMonth();
      if (l.status === "APPROVED") map[m].approved++;
      else if (l.status === "REJECTED") map[m].rejected++;
      else if (l.status === "PENDING") map[m].pending++;
    });

    return MONTH_LABELS.map((month, i) => ({ month, ...map[i] }));
  }, [leaves]);

  // ── Leave usage bar chart ──
  const usageData = useMemo(() => {
    const yearLeaves = leaves.filter(
      (l) => l.status === "APPROVED" && new Date(l.start_date).getFullYear() === currentYear
    );
    const usedDays = yearLeaves.reduce((sum, l) => sum + (l.duration_days ?? l.total_days ?? 0), 0);
    return [
      { name: "Used", days: usedDays, fill: "#2563EB" },
      { name: "Remaining", days: Math.max(MAX_ANNUAL_LEAVE - usedDays, 0), fill: "#BFDBFE" },
    ];
  }, [leaves, currentYear]);

  // ── Quick insights ──
  const approvalRate = useMemo(() => {
    const reviewedCount = leaves.filter((l) => l.status === "APPROVED" || l.status === "REJECTED").length;
    if (!reviewedCount) return 0;
    return Math.round((stats.approved / reviewedCount) * 100);
  }, [leaves, stats]);

  const currentMonthLeaves = useMemo(
    () => leaves.filter((l) => new Date(l.start_date).getMonth() === currentMonth && new Date(l.start_date).getFullYear() === currentYear).length,
    [leaves, currentMonth, currentYear]
  );

  const currentYearLeaves = useMemo(
    () => leaves.filter((l) => new Date(l.start_date).getFullYear() === currentYear).length,
    [leaves, currentYear]
  );

  const avgDuration = useMemo(() => {
    const withDays = leaves.filter((l) => l.status === "APPROVED");
    if (!withDays.length) return 0;
    const total = withDays.reduce((sum, l) => sum + (l.duration_days ?? l.total_days ?? 0), 0);
    return (total / withDays.length).toFixed(1);
  }, [leaves]);

  const usedDays = MAX_ANNUAL_LEAVE - stats.remaining;

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-[18px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Section heading */}
      <div className="flex items-center gap-2.5">
        <BarChart2 className="h-5 w-5 text-muted-foreground" />
        <h2 className="font-heading font-bold text-lg text-foreground">Employee Analytics</h2>
      </div>

      {/* Quick Insights Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Approval Rate", value: `${approvalRate}%`, icon: CheckCircle2, color: "text-[#16A34A]" },
          { label: "This Month", value: currentMonthLeaves, icon: Calendar, color: "text-[#2563EB]" },
          { label: "This Year", value: currentYearLeaves, icon: TrendingUp, color: "text-[#7C3AED]" },
          { label: "Avg Duration", value: `${avgDuration}d`, icon: Clock, color: "text-[#D97706]" },
          { label: "Annual Quota", value: `${usedDays}/${MAX_ANNUAL_LEAVE}d`, icon: Target, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-[14px] border border-border bg-card px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
            <p className={`font-mono text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Balance Progress Ring */}
        <ChartCard title="Leave Balance" icon={Target}>
          <div className="relative flex items-center justify-center h-44">
            <BalanceRing used={usedDays} total={MAX_ANNUAL_LEAVE} />
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="font-mono text-3xl font-bold text-foreground">{stats.remaining}</span>
              <span className="text-xs text-muted-foreground font-medium">days left</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 border-t border-[#F1F5F9] pt-3">
            <span>Used: <strong className="text-foreground">{usedDays}d</strong></span>
            <span>Total: <strong className="text-foreground">{MAX_ANNUAL_LEAVE}d</strong></span>
            <span>Left: <strong className="text-[#2563EB]">{stats.remaining}d</strong></span>
          </div>
        </ChartCard>

        {/* 2. Status Distribution (Donut) */}
        <ChartCard title="Leave Status Distribution" icon={CheckCircle2}>
          {statusData.length === 0 ? (
            <div className="flex h-44 items-center justify-center text-xs text-muted-foreground">No leave data</div>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94A3B8"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 3. Usage Bar */}
        <ChartCard title="Annual Leave Usage" icon={BarChart2}>
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={usageData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />
              <Bar dataKey="days" radius={[6, 6, 0, 0]}>
                {usageData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly Trend — full width */}
      <ChartCard title="Monthly Leave Trend" icon={TrendingUp}>
        {leaves.length === 0 ? (
          <div className="flex h-44 items-center justify-center text-xs text-muted-foreground">No leave data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs capitalize text-muted-foreground">{value}</span>}
              />
              <Line type="monotone" dataKey="approved" stroke="#16A34A" strokeWidth={2} dot={false} name="Approved" />
              <Line type="monotone" dataKey="pending" stroke="#D97706" strokeWidth={2} dot={false} name="Pending" />
              <Line type="monotone" dataKey="rejected" stroke="#DC2626" strokeWidth={2} dot={false} name="Rejected" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
