import { Zap } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/8 bg-white/4">
                <Zap className="h-5 w-5 text-white/20" />
            </div>
            <p className="mb-1 text-sm font-medium text-white/40">
                No Projects Yet
            </p>
            <p className="mb-6 text-xs text-white/20">
                Head To The Home Page And Describe What You Want To Build.
            </p>
            <Link
                href="/"
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
            >
                Start Building
            </Link>
        </div>
    );
}
