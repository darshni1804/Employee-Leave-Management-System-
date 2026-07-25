/**
 * TechnodhaLogo — Brand logo component for Technodha LeaveMate [TLM].
 *
 * Renders the Technodha logo mark with custom typography & orange-coral gradient beacon icon.
 */
import { cn } from "@/lib/utils";

interface TechnodhaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export function TechnodhaLogo({
  className,
  size = "md",
  showSubtitle = true,
}: TechnodhaLogoProps) {
  const sizeMap = {
    sm: { icon: "h-6 w-6", title: "text-sm", badge: "text-[10px]" },
    md: { icon: "h-8 w-8", title: "text-base", badge: "text-xs" },
    lg: { icon: "h-10 w-10", title: "text-xl", badge: "text-xs" },
  };

  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Technodha Icon */}
      <svg
        className={cn("shrink-0", s.icon)}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Technodha Logo"
      >
        <defs>
          <linearGradient
            id="technodha-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="50%" stopColor="#FF3B4E" />
            <stop offset="100%" stopColor="#E61C5D" />
          </linearGradient>
        </defs>

        {/* Outer Ring / Disc */}
        <circle cx="50" cy="50" r="46" fill="url(#technodha-grad)" />

        {/* Inner Upward Arrow/Rocket */}
        <path
          d="M50 20 L68 64 C64 60, 56 56, 50 56 C44 56, 36 60, 32 64 Z"
          fill="#FFFFFF"
        />
        <circle cx="50" cy="72" r="4" fill="#FFFFFF" opacity="0.9" />
      </svg>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-extrabold tracking-tight text-foreground font-sans",
              s.title
            )}
          >
            TECHN<span className="text-primary font-black">O</span>DH
            <span className="inline-block font-mono font-bold tracking-tighter">
              Λ
            </span>
          </span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary tracking-wider uppercase">
            TLM
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-semibold text-muted-foreground tracking-wide mt-0.5">
            LeaveMate
          </span>
        )}
      </div>
    </div>
  );
}
