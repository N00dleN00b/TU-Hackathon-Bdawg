import { appConfig } from "@/config/app"

export function AppLogo() {
    return (
        <div className='flex items-center gap-2'>
            <svg viewBox="0 0 24 24" className='size-6' fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="fill-primary/10 stroke-primary" />
                <path d="m9 12 2 2 4-4" className="stroke-primary" />
            </svg>
            <span className="font-semibold text-nowrap">{appConfig.name}</span>
        </div>
    )
}