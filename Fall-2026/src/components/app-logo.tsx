import { appConfig } from "@/config/app"

// Reusable RealityCheck logo icon — traces the circular reticle + circuit design.
// Uses currentColor so it inherits text color in any context.
export function RealityCheckIcon() { return (
  <img src="../../public/app-logo.png" className="rounded-4xl w-20 h-20"/>
);}
export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <RealityCheckIcon className="size-6 text-primary" />
      <span className="font-semibold text-nowrap">{appConfig.name}</span>
    </div>
  )
}
