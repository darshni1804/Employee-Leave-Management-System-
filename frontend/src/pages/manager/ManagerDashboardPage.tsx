/**
 * ManagerDashboardPage — Complete Manager Module Page.
 *
 * Displays:
 * - Real-time Manager Statistics cards (Pending, Approved Today, Total Employees, etc.)
 * - Search & Filter bar (employee name, ID, email, reason, status, date range)
 * - Manager Leave Table (with Approve & Reject actions for PENDING requests)
 * - Pagination controls
 * - Review modal for confirming actions with optional comments
 */
import { useState } from "react";
import { Users, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useManagerStats } from "@/features/manager/hooks/useManagerStats";
import { useManagerLeaves } from "@/features/manager/hooks/useManagerLeaves";
import { ManagerStatCards } from "@/features/manager/components/ManagerStatCards";
import { ManagerLeaveFiltersBar } from "@/features/manager/components/ManagerLeaveFiltersBar";
import { ManagerLeaveTable } from "@/features/manager/components/ManagerLeaveTable";
import { ReviewModal } from "@/features/manager/components/ReviewModal";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/ui/Skeleton";
import type { LeaveRequest } from "@/types";

export function ManagerDashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading: isStatsLoading, refresh: refreshStats } = useManagerStats();
  const {
    leaves,
    pagination,
    isLoading: isLeavesLoading,
    error,
    filters,
    setFilters,
    refresh: refreshLeaves,
  } = useManagerLeaves();

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const handleApproveClick = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setActionType("approve");
  };

  const handleRejectClick = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setActionType("reject");
  };

  const handleModalClose = () => {
    setSelectedLeave(null);
    setActionType(null);
  };

  const handleReviewSuccess = () => {
    refreshLeaves();
    refreshStats();
  };

  const displayName = user?.first_name || user?.name || "Manager";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Welcome back, {displayName}. Manage team leave requests and view organisation statistics.
        </p>
      </div>

      {/* Statistics Cards */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold">Team Statistics</h2>
        </div>
        <ManagerStatCards stats={stats} isLoading={isStatsLoading} />
      </section>

      {/* Leave Requests Management Section */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              All Leave Requests
            </h2>
            <p className="text-xs text-muted-foreground">
              Review, approve, or reject employee leave applications.
            </p>
          </div>
          {!isLeavesLoading && pagination && (
            <span className="text-xs text-muted-foreground self-start sm:self-auto">
              Total {pagination.count} request{pagination.count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search & Filters */}
        <ManagerLeaveFiltersBar
          filters={filters}
          onChange={setFilters}
          isLoading={isLeavesLoading}
        />

        {/* Error notification */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Table or Skeleton */}
        {isLeavesLoading ? (
          <SkeletonTable rows={6} cols={9} />
        ) : (
          <ManagerLeaveTable
            leaves={leaves}
            onApproveClick={handleApproveClick}
            onRejectClick={handleRejectClick}
          />
        )}

        {/* Pagination */}
        {!isLeavesLoading && pagination && pagination.total_pages > 1 && (
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
      </section>

      {/* Review Modal (Approve / Reject) */}
      <ReviewModal
        leave={selectedLeave}
        actionType={actionType}
        onClose={handleModalClose}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
