'use client';

import React from 'react';
import { LeadsSection } from '../constants/types';
import { useScrollspy } from '../hooks/use-scrollspy';

interface LeadsMobileNavProps {
    sections: LeadsSection[];
}

/** Горизонтальная навигация секций для экранов без sidebar. */
export const LeadsMobileNav: React.FC<LeadsMobileNavProps> = ({ sections }) => {
    const activeId = useScrollspy(sections.map((section) => section.id));

    return (
        <nav
            aria-label="Секции страницы"
            className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur lg:hidden"
        >
            <div className="flex gap-1 overflow-x-auto px-4 py-2">
                {sections.map((section) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${
                            activeId === section.id
                                ? 'bg-primary/10 font-semibold text-primary'
                                : 'text-muted-foreground'
                        }`}
                    >
                        {section.navLabel}
                    </a>
                ))}
            </div>
        </nav>
    );
};
