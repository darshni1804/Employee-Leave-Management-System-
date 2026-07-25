/**
 * ManagerAnalytics — Analytics section embedded in the Manager Dashboard.
 *
 * Data sources (existing APIs only):
 *  - managerService.getStatistics()  → ManagerStatistics
 *  - managerService.getLeaveRequests() → all leave requests (page_size=100)
 *
 * Charts:
 *  1. Monthly Leave Requests (Line)
 *  2. Leave Status Distribution (Donut)
 *  3. Approval vs Rejection (Stacked Bar)
 *  4. Monthly Approval Trend (Area)
 *  5. Employee Leave Utilization (Horizontal Bar)
 *  6. Insights Panel
 */
import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  BarChart2,
  AlertCircle,
  Trophy,
  Percent,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { LeaveRequest, ManagerStatistics } from "@/types";

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#16A34A",
  PENDING: "#D97706",
  REJECTED: "#DC2626",
  CANCELLED: "#94A3B8",
};

// ─────────────────────────────────────────
// Chart card wrapper
// ─────────────────────────────────────────
function ChartCard({ title, icon: Icon, children, className }: { title: string; icon: React.ElementType; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[18px] border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] ${className ?? ""}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-[#475569]" />
        <h3 className="font-heading font-semibold text-sm text-[#111827]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-[#111827] mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Props
// ─────────────────────────────────────────
interface ManagerAnalyticsProps {
  leaves: LeaveRequest[];
  stats: ManagerStatistics | null;
  isLoading: boolean;
}

export function ManagerAnalytics({ leaves, stats, isLoading }: ManagerAnalyticsProps) {
  // ── Monthly Leave Requests trend ──
  const monthlyRequests = useMemo(() => {
    const map: Record<number, { total: number; approved: number; rejected: number; pending: number }> = {};
    for (let m = 0; m < 12; m++) map[m] = { total: 0, approved: 0, rejected: 0, pending: 0 };

    leaves.forEach((l) => {
      const m = new Date(l.start_date).getMonth();
      map[m].total++;
      if (l.status === "APPROVED") map[m].approved++;
      else if (l.status === "REJECTED") map[m].rejected++;
      else if (l.status === "PENDING") map[m].pending++;
    });

    return MONTH_LABELS.map((month, i) => ({ month, ...map[i] }));
  }, [leaves]);

  // ── Status distribution ──
  const statusData = useMemo(() => {
    const counts = { APPROVED: 0, PENDING: 0, REJECTED: 0, CANCELLED: 0 };
    leaves.forEach((l) => {
      if (l.status in counts) counts[l.status as keyof typeof counts]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [leaves]);

  // ── Monthly approval trend (area) ──
  const approvalTrend = useMemo(() => {
    return monthlyRequests.map((m) => ({
      month: m.month,
      approved: m.approved,
      rejected: m.rejected,
    }));
  }, [monthlyRequests]);

  // ── Employee utilization (top 8 by leave count) ──
  const utilizationData = useMemo(() => {
    const empMap: Record<string, number> = {};
    leaves.forEach((l) => {
      if (l.employee) {
        const name = l.employee.name || `${l.employee.first_name} ${l.employee.last_name}`.trim() || l.employee.email;
        empMap[name] = (empMap[name] ?? 0) + 1;
      }
    });
    return Object.entries(empMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name: name.split(" ")[0], count })); // First name only for brevity
  }, [leaves]);

  // ── Insights ──
  const approvalRate = useMemo(() => {
    if (!stats) return 0;
    const reviewed = stats.approved_total + stats.rejected_total;
    if (!reviewed) return 0;
    return Math.round((stats.approved_total / reviewed) * 100);
  }, [stats]);

  const pendingCount = stats?.pending_requests ?? 0;

  // Most active employee
  const mostActive = utilizationData[0]?.name ?? "—";
  const mostActiveCount = utilizationData[0]?.count ?? 0;

  // Longest leave
  const longestLeave = useMemo(() => {
    if (!leaves.length) return null;
    return leaves.reduce((max, l) => {
      const d = l.duration_days ?? l.total_days ?? 0;
      return d > (max.duration_days ?? max.total_days ?? 0) ? l : max;
    });
  }, [leaves]);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-2">
        <Skeleton className="h-6 w-52" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
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
        <BarChart2 className="h-5 w-5 text-[#475569]" />
        <h2 className="font-heading font-bold text-lg text-[#111827]">Manager Analytics</h2>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Approval Rate", value: `${approvalRate}%`, icon: Percent, color: "text-[#16A34A]" },
          { label: "Pending Reviews", value: pendingCount, icon: Clock, color: "text-[#D97706]" },
          { label: "Most Active", value: mostActive, icon: Trophy, color: "text-[#7C3AED]" },
          { label: "Approved Total", value: stats?.approved_total ?? 0, icon: CheckCircle2, color: "text-[#2563EB]" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-3.5 w-3.5 ${color}`} />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">{label}</span>
            </div>
            <p className={`font-mono text-xl font-bold ${color} truncate`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Monthly Leave Requests (Line) */}
        <ChartCard title="Monthly Leave Requests" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyRequests} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" stroke="#2563EB" strokeWidth={2.5} dot={false} name="Total" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Status Distribution (Donut) */}
        <ChartCard title="Leave Status Distribution" icon={CheckCircle2}>
          {statusData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-[#94A3B8]">No leave data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
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
                  formatter={(v) => <span className="text-xs text-[#475569]">{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 3. Approval vs Rejection (Stacked Bar) */}
        <ChartCard title="Approval vs Rejection" icon={BarChart2}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRequests} margin={{ top: 4, right: 16, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-[#475569]">{v}</span>} />
              <Bar dataKey="approved" name="Approved" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#DC2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Monthly Approval Trend (Area) */}
        <ChartCard title="Monthly Approval Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={approvalTrend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rejectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-[#475569]">{v}</span>} />
              <Area type="monotone" dataKey="approved" name="Approved" stroke="#16A34A" strokeWidth={2} fill="url(#approvedGrad)" dot={false} />
              <Area type="monotone" dataKey="rejected" name="Rejected" stroke="#DC2626" strokeWidth={2} fill="url(#rejectedGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Employee Utilization + Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Employee Leave Utilization (Horizontal Bar) */}
        <ChartCard title="Employee Leave Utilization" icon={Users}>
          {utilizationData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-[#94A3B8]">No employee data</div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(utilizationData.length * 32, 160)}>
              <BarChart
                layout="vertical"
                data={utilizationData}
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />
                <Bar dataKey="count" name="Leaves" fill="#2563EB" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Insights Panel */}
        <ChartCard title="Insights" icon={AlertCircle}>
          <div className="space-y-3">
            {[
              {
                label: "Pending Approvals",
                value: `${pendingCount} request${pendingCount !== 1 ? "s" : ""} awaiting review`,
                icon: Clock,
                color: "text-[#D97706]",
                bg: "bg-[#FFFBEB]",
              },
              {
                label: "Approval Rate",
                value: `${approvalRate}% of reviewed requests approved`,
                icon: Percent,
                color: "text-[#16A34A]",
                bg: "bg-[#F0FDF4]",
              },
              {
                label: "Most Active Employee",
                value: mostActive !== "—" ? `${mostActive} with ${mostActiveCount} request${mostActiveCount !== 1 ? "s" : ""}` : "No data",
                icon: Trophy,
                color: "text-[#7C3AED]",
                bg: "bg-[#F5F3FF]",
              },
              {
                label: "Longest Leave",
                value: longestLeave
                  ? `${longestLeave.duration_days ?? longestLeave.total_days ?? 0} days (${longestLeave.employee?.name ?? "Employee"})`
                  : "No approved leaves",
                icon: TrendingUp,
                color: "text-[#2563EB]",
                bg: "bg-[#EFF6FF]",
              },
              {
                label: "Total Approved (All Time)",
                value: `${stats?.approved_total ?? 0} requests`,
                icon: CheckCircle2,
                color: "text-[#16A34A]",
                bg: "bg-[#F0FDF4]",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl p-3 border border-[#F1F5F9]">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">{label}</p>
                  <p className="text-xs font-medium text-[#111827] mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
