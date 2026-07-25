/**
 * LeavesPage — Employee leave management page matching Reference Image 3 design system.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Plus, ClipboardList, ShieldAlert, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
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

type Tab = "history" | "apply";

export function LeavesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("history");
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
    setActiveTab("history");
    refresh();
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "history", label: "My Leaves", icon: ClipboardList },
    { id: "apply", label: "Apply Leave", icon: Plus },
  ];

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <PageHeader
        icon={CalendarDays}
        title="Leave Requests"
        subtitle="Manage, track, and apply for your leave requests."
      />

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 font-sans text-sm font-semibold border-b-2 transition-colors cursor-pointer",
              activeTab === id
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#64748B] hover:text-[#111827] hover:border-slate-300"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab: My Leaves */}
      {activeTab === "history" && (
        <div className="space-y-5">
          <LeaveFilters
            filters={filters}
            onChange={setFilters}
            isLoading={isLoading}
          />

          {!isLoading && pagination && (
            <p className="font-sans text-xs text-[#64748B]">
              {pagination.count === 0
                ? "No leave records found"
                : `Showing ${leaves.length} of ${pagination.count} request${pagination.count !== 1 ? "s" : ""}`}
            </p>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : (
            <LeaveHistoryTable
              leaves={leaves}
              onCancelClick={handleCancelClick}
            />
          )}

          {!isLoading && pagination && pagination.total_pages > 1 && (
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
        </div>
      )}

      {/* Tab: Apply Leave */}
      {activeTab === "apply" && (
        <ApplyLeaveForm onSuccess={handleApplySuccess} />
      )}

      {/* Cancel Confirmation Dialog */}
      <CancelLeaveDialog
        leave={selectedLeave}
        onClose={handleCancelClose}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}
