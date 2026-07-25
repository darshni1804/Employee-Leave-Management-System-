/**
 * TechnodhaLogo — Brand logo component matching Reference Image 3.
 *
 * Requirements:
 * - Complete TECHNODHA LEAVEMATE logo image
 * - Single-line text, no line wrapping
 * - Max width ~220px, object-fit contain, preserve aspect ratio
 * - When collapsed: Shows ONLY the LM icon mark centered
 */
import { cn } from "@/lib/utils";

interface TechnodhaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  collapsed?: boolean;
  variant?: "horizontal" | "vertical";
}

export function TechnodhaLogo({
  className,
  size = "md",
  collapsed = false,
  variant = "horizontal",
}: TechnodhaLogoProps) {
  const iconSizeMap = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
  };

  const iconClass = iconSizeMap[size] || "h-9 w-9";

  // LM Icon Mark (Navy 'L' + Orange 'M' with head circle)
  const LMMark = (
    <svg
      className={cn("shrink-0", iconClass)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="LM Icon"
    >
      {/* Dark Navy 'L' Shape */}
      <path
        d="M 20 10 L 36 10 L 36 62 L 64 62 L 74 76 L 32 76 C 25 76, 20 71, 20 64 Z"
        className="fill-foreground"
      />
      {/* Orange 'M' Head Circle */}
      <circle cx="58" cy="18" r="8" fill="#FF5A00" />
      {/* Orange 'M' Stylized Body */}
      <path
        d="M 38 24 L 58 54 L 78 24 L 92 24 L 92 76 L 78 76 L 78 40 L 58 70 L 44 48 Z"
        fill="#FF5A00"
      />
    </svg>
  );

  // If collapsed: Show only the LM icon centered
  if (collapsed) {
    return (
      <div className={cn("flex items-center justify-center w-full py-2 select-none", className)}>
        {LMMark}
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col items-center text-center select-none", className)}>
        {LMMark}
        <div className="mt-3 flex flex-col items-center min-w-0">
          <div className="flex items-center whitespace-nowrap font-black tracking-tight font-sans text-xl">
            <span className="text-foreground">TECHN</span>
            <span className="text-[#FF5A00]">O</span>
            <span className="text-foreground">DHA</span>
            <span className="text-foreground ml-1.5">LEAVE</span>
            <span className="text-[#FF5A00]">MATE</span>
          </div>
          <div className="h-[1px] w-full bg-slate-300 my-1 opacity-80" />
          <span className="whitespace-nowrap text-[9px] font-bold text-muted-foreground tracking-widest uppercase">
            SMART LEAVE MANAGEMENT SYSTEM
          </span>
        </div>
      </div>
    );
  }

  // Expanded: Complete TECHNODHA LEAVEMATE logo image layout
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 max-w-[220px] w-full select-none overflow-hidden",
        className
      )}
    >
      {LMMark}

      <div className="flex flex-col leading-none min-w-0">
        {/* Title row */}
        <div className="flex items-center whitespace-nowrap text-xs font-black tracking-tight font-sans">
          <span className="text-foreground">TECHN</span>
          <span className="text-[#FF5A00]">O</span>
          <span className="text-foreground">DHA</span>
          <span className="text-foreground ml-1.5">LEAVE</span>
          <span className="text-[#FF5A00]">MATE</span>
        </div>

        {/* Divider Line */}
        <div className="h-[1px] w-full bg-slate-300 my-[3px] opacity-80" />

        {/* Subtitle */}
        <span className="whitespace-nowrap text-[7px] font-bold text-muted-foreground tracking-wider uppercase">
            SMART LEAVE MANAGEMENT SYSTEM
        </span>
      </div>
    </div>
  );
}
