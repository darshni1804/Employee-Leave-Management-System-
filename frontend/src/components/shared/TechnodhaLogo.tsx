/**
 * TechnodhaLogo — Brand logo component for Technodha LeaveMate.
 *
 * Rendered using the LM icon mark (Dark Navy 'L' + Orange Person 'M')
 * with clean typography for title & subtitle.
 */
import { cn } from "@/lib/utils";

interface TechnodhaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  variant?: "horizontal" | "vertical";
}

export function TechnodhaLogo({
  className,
  size = "md",
  showSubtitle = true,
  variant = "horizontal",
}: TechnodhaLogoProps) {
  const sizeMap = {
    sm: { icon: "h-7 w-7", title: "text-sm", subtitle: "text-[10px]" },
    md: { icon: "h-9 w-9", title: "text-base", subtitle: "text-[11px]" },
    lg: { icon: "h-14 w-14", title: "text-2xl", subtitle: "text-xs" },
  };

  const s = sizeMap[size];

  // SVG representation of the LM Icon Mark:
  // L = Dark Navy (#161233)
  // M = Vibrant Orange (#FF5A00) with person head circle
  const LMMark = (
    <svg
      className={cn("shrink-0", s.icon)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Technodha LeaveMate Logo"
    >
      {/* Dark Navy 'L' Shape */}
      <path
        d="M 20 10 
           L 36 10 
           L 36 62 
           L 64 62 
           L 74 76 
           L 32 76 
           C 25 76, 20 71, 20 64 Z"
        fill="#161233"
      />

      {/* Orange 'M' Person Head Circle */}
      <circle cx="58" cy="18" r="8" fill="#FF5A00" />

      {/* Orange 'M' Stylized Body */}
      <path
        d="M 38 24 
           L 58 54 
           L 78 24 
           L 92 24 
           L 92 76 
           L 78 76 
           L 78 40 
           L 58 70 
           L 44 48 
           Z"
        fill="#FF5A00"
      />
    </svg>
  );

  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col items-center text-center select-none", className)}>
        {LMMark}
        <div className="mt-3 flex flex-col items-center">
          <div className="flex items-center gap-1 font-extrabold tracking-tight text-foreground font-sans text-xl">
            <span className="text-[#161233]">TECHN</span>
            <span className="text-[#FF5A00]">O</span>
            <span className="text-[#161233]">DH^</span>
            <span className="text-[#161233] ml-1">LEAVE</span>
            <span className="text-[#FF5A00]">MATE</span>
          </div>
          {showSubtitle && (
            <span className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase mt-1">
              Smart Employee Leave Management System
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {LMMark}

      <div className="flex flex-col leading-tight">
        <div className={cn("font-extrabold tracking-tight font-sans flex items-center flex-wrap gap-x-1", s.title)}>
          <span className="text-[#161233]">TECHN<span className="text-[#FF5A00]">O</span>DH<span className="font-mono font-bold">^</span></span>
          <span className="text-[#161233]">LEAVE<span className="text-[#FF5A00]">MATE</span></span>
        </div>
        {showSubtitle && (
          <span className={cn("font-semibold text-muted-foreground tracking-wider uppercase opacity-85 mt-0.5", s.subtitle)}>
            Smart Employee Leave Management System
          </span>
        )}
      </div>
    </div>
  );
}
