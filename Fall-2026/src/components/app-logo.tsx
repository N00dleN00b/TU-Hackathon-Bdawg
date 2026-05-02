import { appConfig } from "@/config/app"
import { cn } from "@/lib/utils"

export function RealityCheckIcon({ className }: { className?: string }) {
  return (
    <img src="../../public/app-logo.png" className={cn("rounded-4xl w-20 h-20", className)} />
  )
}

export function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <RealityCheckIcon className="size-6" />
      <span className="font-semibold text-nowrap">{appConfig.name}</span>
    </div>
  )
}
