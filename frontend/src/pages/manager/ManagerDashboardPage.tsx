/**
 * ManagerDashboardPage — Manager Module Dashboard matching Reference Image 3.
 */
import { useState } from "react";
import { ClipboardCheck, Users } from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useManagerStats } from "@/features/manager/hooks/useManagerStats";
import { useManagerLeaves } from "@/features/manager/hooks/useManagerLeaves";
import { ManagerStatCards } from "@/features/manager/components/ManagerStatCards";
import { ManagerLeaveFiltersBar } from "@/features/manager/components/ManagerLeaveFiltersBar";
import { ManagerLeaveTable } from "@/features/manager/components/ManagerLeaveTable";
import { ReviewModal } from "@/features/manager/components/ReviewModal";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
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

  const displayName = user?.first_name || user?.name?.split(" ")[0] || "Jane";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header (Matching Reference Image 3) */}
      <PageHeader
        icon={ClipboardCheck}
        title="Manager Dashboard"
        subtitle={`Welcome back, ${displayName}. Manage team leave requests and view organisation insights.`}
      />

      {/* Team Statistics Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-[#475569]" />
          <h2 className="font-heading font-semibold text-lg text-[#111827]">
            Team Statistics
          </h2>
        </div>

        <ManagerStatCards stats={stats} isLoading={isStatsLoading} />
      </section>

      {/* Leave Requests Management Section */}
      <section className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-[#111827]">
              All Leave Requests
            </h2>
            <p className="font-sans text-xs text-[#64748B] mt-0.5">
              Review, approve, or reject employee leave applications.
            </p>
          </div>
          {!isLeavesLoading && pagination && (
            <span className="font-sans text-xs font-semibold text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-full self-start sm:self-auto">
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
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
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
            <p className="font-sans text-xs text-[#64748B]">
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
