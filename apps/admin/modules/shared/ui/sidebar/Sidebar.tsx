'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@workspace/ui/lib/utils';
import {
    LayoutDashboard,
    Users,
    Settings,
    Home,
    ChevronRight,
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Клиенты',
        href: '/clients',
        icon: Users,
    },
    {
        title: 'Bitrix Apps',
        href: '/bitrix-apps',
        icon: Settings,
    },
];

export function SidebarAdmin() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">Admin Panel</span>
                </Link>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                            {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">Admin Panel</span>
                </Link>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname?.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                            {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

