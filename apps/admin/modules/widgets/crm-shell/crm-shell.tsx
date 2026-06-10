"use client";

import { Sidebar } from "@/modules/shared/";
import { Header } from "../header/Header";

interface CrmShellProps {
    children: React.ReactNode;
}

export function CrmShell({ children }: CrmShellProps) {
    // const t = useTranslations("crm.shell");
    // const localizedLink = useLocalizedLink();
    // const pathname = usePathname();
    // const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useSidebar();

    // const { currentUser } = useAuth();
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
