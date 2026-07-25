/**
 * LeavesPage — Employee leave management page matching Reference Image 3 design system.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ShieldAlert, ArrowRight } from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useMyLeaves } from "@/features/leaves/hooks/useMyLeaves";
import { LeaveFilters } from "@/features/leaves/components/LeaveFilters";
import { LeaveHistoryTable } from "@/features/leaves/components/LeaveHistoryTable";
import { ApplyLeaveForm } from "@/features/leaves/components/ApplyLeaveForm";
import { CancelLeaveDialog } from "@/features/leaves/components/CancelLeaveDialog";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import type { LeaveRequest } from "@/types";

export function LeavesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);

  const isManager = user?.role === "MANAGER";

  const { leaves, pagination, isLoading, error, filters, setFilters, refresh } =
    useMyLeaves();

  const handleCancelClick = (leave: LeaveRequest) => setSelectedLeave(leave);
  const handleCancelClose = () => setSelectedLeave(null);
  const handleCancelSuccess = () => {
    refresh();
    setSelectedLeave(null);
  };

  const handleApplySuccess = () => {
    refresh();
  };

  // If user is a Manager, show clear Role separation banner
  if (isManager) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <PageHeader
          icon={CalendarDays}
          title="Personal Leave Access"
          subtitle="Role-based access notice"
        />

        <div className="rounded-[18px] border border-amber-200 bg-amber-50/80 p-8 shadow-xs text-left space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg text-amber-900">
                Manager Access Info
              </h2>
              <p className="font-sans text-xs text-amber-700">
                This endpoint is restricted to employee personal leave applications.
              </p>
            </div>
          </div>

          <p className="font-sans text-sm text-amber-800 leading-relaxed">
            As a Manager, your account has access to the <strong>Manager Dashboard</strong>, <strong>Team Leaves</strong>, and <strong>Approvals</strong> where you can review, approve, or reject leave requests submitted by your team members.
          </p>

          <div className="pt-2">
            <button
              onClick={() => navigate("/team/leaves")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 font-sans text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <span>Go to Team Leaves & Approvals</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Section: Apply Leave Card */}
      <section className="space-y-4">
        <ApplyLeaveForm onSuccess={handleApplySuccess} />
      </section>

      {/* Bottom Section: Leave Requests Management */}
      <section className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-foreground">
              My Leave Requests
            </h2>
            <p className="font-sans text-xs text-muted-foreground mt-0.5">
              Apply for leave, track request status, and manage your leave history.
            </p>
          </div>
          {!isLoading && pagination && (
            <span className="font-sans text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full self-start sm:self-auto">
              Total {pagination.count} Request{pagination.count !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search & Filters */}
        <LeaveFilters
          filters={filters}
          onChange={setFilters}
          isLoading={isLoading}
        />

        {/* Error notification */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Table or Skeleton */}
        {isLoading ? (
          <SkeletonTable rows={5} cols={8} />
        ) : (
          <LeaveHistoryTable
            leaves={leaves}
            onCancelClick={handleCancelClick}
          />
        )}

        {/* Pagination */}
        {!isLoading && pagination && pagination.total_pages > 1 && (
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

      {/* Cancel Confirmation Dialog */}
      <CancelLeaveDialog
        leave={selectedLeave}
        onClose={handleCancelClose}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}
