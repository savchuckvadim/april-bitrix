"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/modules/shared/";
import { Header } from "../header/Header";

interface CrmShellProps {
    children: React.ReactNode;
}

export function CrmShell({ children }: CrmShellProps) {
    const pathname = usePathname();

    // Страницы аутентификации — без шапки/сайдбара (голая форма)
    if (pathname.startsWith("/auth")) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-full min-h-0 w-full flex-row overflow-hidden">
            <Sidebar />
            <div className="flex h-full min-h-0 w-full flex-1 flex-col justify-start overflow-hidden">
                <Header />
                <div className="flex-1 min-h-0 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
