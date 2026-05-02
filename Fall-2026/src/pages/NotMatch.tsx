import { buttonVariants } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { RealityCheckIcon } from "@/components/app-logo";

export default function NotMatch() {
    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="space-y-4 text-center">
                <RealityCheckIcon className="size-16 mx-auto text-primary/30 mb-2" />
                <h2 className="text-8xl font-black text-muted-foreground/20">404</h2>
                <h1 className="text-3xl font-semibold">Page not found</h1>
                <p className="text-sm text-muted-foreground">The page you requested doesn't exist or was moved.</p>
                <Link to="/" className={buttonVariants()}>Back to Home</Link>
            </div>
        </div>
    )
}
