'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@workspace/ui/lib/utils';
import { useSection } from '../hooks/use-section';

interface ProcessTabsProps {
    className?: string;
}

/**
 * Вкладки раздела в боковом меню.
 *
 * Список вкладок берётся из контекста раздела, поэтому одна и та же рама
 * показывает и процесс продаж, и базу знаний AI. Конфигурация процесса живёт
 * вне React, и переход между вкладками её не теряет.
 */
export const ProcessTabs: FC<ProcessTabsProps> = ({ className }) => {
    const pathname = usePathname();
    const { tabs, tabPath } = useSection();

    return (
        <nav
            aria-label="Разделы процесса"
            className={cn('flex flex-col gap-0.5', className)}
        >
            {tabs.map(tab => {
                const href = tabPath(tab.slug);
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
