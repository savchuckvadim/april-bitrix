'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@workspace/ui/lib/utils';
import { SALES_TABS, salesTabPath } from '../constants/views';

/**
 * Вкладки процесса на узком экране.
 *
 * Боковое меню на телефоне спрятано, и без этой полосы попасть из схемы в
 * симулятор или теорию было нельзя вообще — разделы существовали, но были
 * недостижимы. Лента прокручивается вбок: четыре вкладки в 390 пикселей не
 * помещаются, а ужимать подписи до нечитаемого хуже, чем дать их пролистать.
 */
export const ProcessTabsMobile: FC = () => {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Разделы процесса"
            className="scrollbar-none flex gap-1.5 overflow-x-auto px-4 pb-2 lg:hidden"
        >
            {SALES_TABS.map(tab => {
                const href = salesTabPath(tab.slug);
                const isActive = pathname === href;

                return (
                    <Link
                        key={tab.slug || 'root'}
                        href={href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            'shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors',
                            isActive
                                ? 'border-primary bg-primary/10 text-primary font-semibold'
                                : 'text-muted-foreground',
                        )}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
};
