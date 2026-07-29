'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HOW_NAV_ITEMS, howPath } from '../constants/nav';

/** Навигация по страницам раздела «Как мы работаем». */
export const HowSectionNav: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav
            aria-label="Разделы «Как мы работаем»"
            className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur"
        >
            <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2">
                {HOW_NAV_ITEMS.map((item) => {
                    const href = howPath(item.slug);
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                                active
                                    ? 'bg-primary/10 font-semibold text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
