/**
 * PageHeader — Shared Page Header component matching Reference Image 3.
 *
 * Specifications:
 * - Icon: Large icon in rounded blue square
 * - Title: Bold Poppins 700 (#111827)
 * - Subtitle: Inter 400 muted (#64748B)
 * - Spacing: 32px bottom margin (mb-8)
 */
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {/* Large Page Icon inside rounded square */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100/80 shadow-xs">
          <Icon className="h-6 w-6" />
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-[#111827] tracking-tight leading-none mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="font-sans font-normal text-sm text-[#64748B] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Action button if provided */}
      {action && <div className="self-start sm:self-auto">{action}</div>}
    </div>
  );
}
