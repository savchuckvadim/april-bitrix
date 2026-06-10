'use client';
import { cn } from "@workspace/ui/lib/utils";

export function ScrollContentWrapper({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("h-full min-h-0 space-y-1 overflow-y-auto p-7 pb-6", className)}>
            {children}
        </div>
    );
}

