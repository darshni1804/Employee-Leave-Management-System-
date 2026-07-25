/**
 * LeavesPage — Full employee leave management page.
 *
 * Features:
 * - Two tabs: "My Leaves" (history) and "Apply Leave" (form)
 * - Search, status filter, date range filter
 * - Responsive paginated table with status badges
 * - Cancel confirmation dialog
 * - Skeleton loading states
 * - Empty state
 * - Auto-refresh after apply/cancel
 */
import { useState } from "react";
import { CalendarDays, Plus, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyLeaves } from "@/features/leaves/hooks/useMyLeaves";
import { LeaveFilters } from "@/features/leaves/components/LeaveFilters";
import { LeaveHistoryTable } from "@/features/leaves/components/LeaveHistoryTable";
import { ApplyLeaveForm } from "@/features/leaves/components/ApplyLeaveForm";
import { CancelLeaveDialog } from "@/features/leaves/components/CancelLeaveDialog";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/ui/Skeleton";
import type { LeaveRequest } from "@/types";

type Tab = "history" | "apply";

export function LeavesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

  const { leaves, pagination, isLoading, error, filters, setFilters, refresh } =
    useMyLeaves();

  const handleCancelClick = (leave: LeaveRequest) => setSelectedLeave(leave);
  const handleCancelClose = () => setSelectedLeave(null);
  const handleCancelSuccess = () => {
    refresh();
    setSelectedLeave(null);
  };

  const handleApplySuccess = () => {
    // Switch to history tab after successful submission
    setActiveTab("history");
    refresh();
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "history", label: "My Leaves", icon: ClipboardList },
    { id: "apply", label: "Apply Leave", icon: Plus },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ── Page header ──────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage and track your leave requests.
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────── */}
      <div className="flex border-b gap-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: My Leaves ───────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Filters */}
          <LeaveFilters
            filters={filters}
            onChange={setFilters}
            isLoading={isLoading}
          />

          {/* Result count */}
          {!isLoading && pagination && (
            <p className="text-xs text-muted-foreground">
              {pagination.count === 0
                ? "No results"
                : `Showing ${leaves.length} of ${pagination.count} request${pagination.count !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Table or skeleton */}
          {isLoading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : (
            <LeaveHistoryTable
              leaves={leaves}
              onCancelClick={handleCancelClick}
            />
          )}

          {/* Pagination */}
          {!isLoading && pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.total_pages}
              </p>
              <Pagination
                page={filters.page ?? 1}
                totalPages={pagination.total_pages}
                onPageChange={(p) => setFilters({ page: p })}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Apply Leave ─────────────────── */}
      {activeTab === "apply" && (
        <ApplyLeaveForm onSuccess={handleApplySuccess} />
      )}

      {/* ── Cancel dialog ────────────────────── */}
      <CancelLeaveDialog
        leave={selectedLeave}
        onClose={handleCancelClose}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}
