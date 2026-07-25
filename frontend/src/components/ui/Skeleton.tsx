/**
 * Skeleton — reusable loading skeleton components.
 *
 * Exports:
 *   Skeleton         — base pulse element
 *   SkeletonCard     — dashboard stat card skeleton
 *   SkeletonTable    — leave history table skeleton
 *   SkeletonText     — single line of text skeleton
 */
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────
// Base
// ─────────────────────────────────────────
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────
// Stat card skeleton (Dashboard)
// ─────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

// ─────────────────────────────────────────
// Table skeleton (Leave History)
// ─────────────────────────────────────────
interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export function SkeletonTable({ rows = 5, cols = 6 }: SkeletonTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/50 px-6 py-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-20" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="border-b last:border-0 px-6 py-4 grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className={cn(
                "h-4",
                colIdx === cols - 1 ? "w-16" : "w-full",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Text skeleton
// ─────────────────────────────────────────
export function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")} />
      ))}
    </div>
  );
}
