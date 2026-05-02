import { appConfig } from "@/config/app"

// Reusable RealityCheck logo icon — traces the circular reticle + circuit design.
// Uses currentColor so it inherits text color in any context.
export function RealityCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring — 4 arc segments with gaps at cardinal crosshair points */}
      <path d="M91.9 52.9 A42 42 0 0 1 52.9 91.9" strokeWidth="3.5" />
      <path d="M47.1 91.9 A42 42 0 0 1 8.1 52.9" strokeWidth="3.5" />
      <path d="M8.1 47.1 A42 42 0 0 1 47.1 8.1" strokeWidth="3.5" />
      <path d="M52.9 8.1 A42 42 0 0 1 91.9 47.1" strokeWidth="3.5" />

      {/* Inner C-arc — 270° arc, opening on the right side */}
      {/* Start: 350° (upper-right) → clockwise → end: 80° (lower-right) */}
      <path d="M76.6 45.3 A27 27 0 1 1 54.7 76.6" strokeWidth="3" />

      {/* Circuit notch — short vertical spur at top of inner arc (right-angle board detail) */}
      <path d="M76.6 45.3 L76.6 37.5" strokeWidth="3" />

      {/* Center scan circle */}
      <circle cx="50" cy="50" r="7" strokeWidth="3" />

      {/* Vertical axis spine — two segments separated by center circle */}
      <line x1="50" y1="0" x2="50" y2="43" strokeWidth="2.8" />
      <line x1="50" y1="57" x2="50" y2="90" strokeWidth="2.8" />

      {/* Two indicator dots above outer ring (top of spine) */}
      <circle cx="50" cy="2.5" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="50" cy="7.5" r="2.4" fill="currentColor" stroke="none" />

      {/* Bottom fork bracket inside outer ring */}
      <path d="M44 86.5 L50 92 L56 86.5" strokeWidth="2.5" fill="none" />

      {/* Left crosshair — outer ring to inner arc */}
      <line x1="8" y1="50" x2="23" y2="50" strokeWidth="2.8" />

      {/* Right crosshair — inner arc gap across to outer ring */}
      <line x1="77" y1="50" x2="92" y2="50" strokeWidth="2.8" />
    </svg>
  )
}

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <RealityCheckIcon className="size-6 text-primary" />
      <span className="font-semibold text-nowrap">{appConfig.name}</span>
    </div>
  )
}
