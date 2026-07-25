/**
 * LeaveFilters — search + status + date range filter bar.
 *
 * Props:
 *   filters     — current filter values
 *   onChange    — called when any filter changes
 *   isLoading   — disables inputs while loading
 */
import { Search, X } from "lucide-react";
import type { EmployeeLeaveFilters } from "../types";
import type { LeaveStatus } from "@/types";
import { cn } from "@/lib/utils";

interface LeaveFiltersProps {
  filters: EmployeeLeaveFilters;
  onChange: (filters: Partial<EmployeeLeaveFilters>) => void;
  isLoading?: boolean;
  className?: string;
}

const STATUS_OPTIONS: { value: LeaveStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
];

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground disabled:opacity-60";

export function LeaveFilters({
  filters,
  onChange,
  isLoading,
  className,
}: LeaveFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.status || filters.start_date || filters.end_date;

  const clearAll = () => {
    onChange({ search: "", status: undefined, start_date: "", end_date: "" });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reason..."
            value={filters.search ?? ""}
            disabled={isLoading}
            onChange={(e) => onChange({ search: e.target.value })}
            className={cn(inputCls, "pl-9")}
            aria-label="Search leave requests"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status ?? ""}
          disabled={isLoading}
          onChange={(e) =>
            onChange({
              status: (e.target.value as LeaveStatus) || undefined,
            })
          }
          className={inputCls}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Start Date */}
        <input
          type="date"
          value={filters.start_date ?? ""}
          disabled={isLoading}
          onChange={(e) => onChange({ start_date: e.target.value || undefined })}
          className={inputCls}
          aria-label="Filter from date"
        />

        {/* End Date */}
        <input
          type="date"
          value={filters.end_date ?? ""}
          min={filters.start_date}
          disabled={isLoading}
          onChange={(e) => onChange({ end_date: e.target.value || undefined })}
          className={inputCls}
          aria-label="Filter to date"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear all filters
        </button>
      )}
    </div>
  );
}
