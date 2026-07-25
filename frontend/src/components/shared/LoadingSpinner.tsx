/**
 * Reusable loading spinner component.
 */
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /** Size in pixels */
  size?: "sm" | "md" | "lg";
  /** Optional label for accessibility */
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-4",
};

export function LoadingSpinner({
  size = "md",
  label = "Loading...",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center", className)}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-muted border-t-primary",
          sizeMap[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <LoadingSpinner size="lg" label="Loading application..." />
    </div>
  );
}
