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
    Link2,
    Activity
} from 'lucide-react';

import { useCurrentSideBar } from '@/modules/processes';

const getIconByEntityName = (entityName: string) => {
    switch (entityName) {
        case 'client':
            return Users;
        case 'bitrix-app':
            return Settings;
        default:
            return Activity;
    }
}

/**
 * Пункт активен, если путь совпадает с его ссылкой или лежит под ней.
 * Сравнение по сегменту: подстрока делала `/contract` активным и на
 * `/contract-template` — «Виды договоров» горели вместе с «Шаблонами договоров».
 */
const getIsActive = (href: string, pathname: string | null) =>
    Boolean(pathname) && (pathname === href || pathname!.startsWith(`${href}/`));


export function Sidebar() {
    const pathname = usePathname();
    const {currentNavItems, baseUrl} = useCurrentSideBar();
    return (
        <div className="flex h-screen w-[200px] flex-col ">
            <div className="flex h-16 items-center  px-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Home className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">Admin Panel</span>
                </Link>
            </div>
            <nav className="flex-1 space-y-1 p-4">
                {currentNavItems.map((item) => {
                    const Icon = getIconByEntityName(item.item.name);
                    const href = `${baseUrl}${item.item.get.url}`;
                    const isActive = getIsActive(href, pathname);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.item.title}</span>
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

