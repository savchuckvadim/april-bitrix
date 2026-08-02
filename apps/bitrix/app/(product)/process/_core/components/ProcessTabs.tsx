'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@workspace/ui/lib/utils';
import { SALES_TABS, salesTabPath } from '../constants/views';

interface ProcessTabsProps {
    className?: string;
}

/**
 * Вкладки процесса в боковом меню.
 *
 * Конфигурация общая и живёт вне React, поэтому переход между вкладками её не
 * теряет: симулятор проходит ровно ту схему, которую вы собрали рядом.
 */
export const ProcessTabs: FC<ProcessTabsProps> = ({ className }) => {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Разделы процесса"
            className={cn('flex flex-col gap-0.5', className)}
        >
            {SALES_TABS.map(tab => {
                const href = salesTabPath(tab.slug);
                const isActive = pathname === href;

                return (
                    <Link
                        key={tab.slug || 'root'}
                        href={href}
                        title={tab.hint}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            'cursor-pointer rounded-md px-2 py-1.5 text-sm transition-colors',
                            isActive
                                ? 'bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
};
