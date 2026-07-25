import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { useManagerLeaves } from "@/features/manager/hooks/useManagerLeaves";
import { ManagerLeaveFiltersBar } from "@/features/manager/components/ManagerLeaveFiltersBar";
import { ManagerLeaveTable } from "@/features/manager/components/ManagerLeaveTable";
import { ManagerLeaveDrawer } from "@/features/manager/components/ManagerLeaveDrawer";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import type { LeaveRequest } from "@/types";

export function ManagerTeamLeavesPage() {
  const {
    leaves,
    pagination,
    isLoading: isLeavesLoading,
    error,
    filters,
    setFilters,
    refresh: refreshLeaves,
  } = useManagerLeaves();

  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // When clicking view details in the table, open drawer
  const handleViewDetails = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedLeave(null), 300); // clear after animation
  };

  const handleReviewSuccess = () => {
    refreshLeaves();
    handleDrawerClose();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        icon={ClipboardList}
        title="Team Leave Requests"
        subtitle="Review, approve and manage employee leave requests."
      />

      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground">
              All Leave Requests
            </h2>
            <p className="font-sans text-xs text-muted-foreground mt-0.5">
              Comprehensive list of team leave applications.
            </p>
          </div>
          {!isLeavesLoading && pagination && (
            <span className="font-sans text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full self-start sm:self-auto">
              Total {pagination.count} request{pagination.count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <ManagerLeaveFiltersBar
          filters={filters}
          onChange={setFilters}
          isLoading={isLeavesLoading}
        />

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {isLeavesLoading ? (
          <SkeletonTable rows={6} cols={9} />
        ) : (
          <ManagerLeaveTable
            leaves={leaves}
            onViewDetails={handleViewDetails}
          />
        )}

        {!isLeavesLoading && pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="font-sans text-xs text-muted-foreground">
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

      <ManagerLeaveDrawer
        leave={selectedLeave}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
