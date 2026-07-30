'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { LeadsSection } from '../constants/types';
import { useScrollspy } from '../hooks/use-scrollspy';

interface LeadsSidebarProps {
    sections: LeadsSection[];
}

/** Левый sidebar в стиле CRM-кабинета: навигация по секциям + быстрый переход к листу решений. */
export const LeadsSidebar: React.FC<LeadsSidebarProps> = ({ sections }) => {
    const activeId = useScrollspy(sections.map((section) => section.id));

    return (
        <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
            <div className="sticky top-0 flex max-h-screen flex-col gap-1 overflow-y-auto p-4">
                <Link
                    href="/how-we-work/inbound"
                    className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Как мы работаем
                </Link>
                <p className="mb-1 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Бизнес-процесс лидов
                </p>
                {sections.map((section) => (
                    <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                            activeId === section.id
                                ? 'bg-primary/10 font-semibold text-primary'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        }`}
                    >
                        {section.navLabel}
                    </a>
                ))}
                <a
                    href="#decisions"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-success/50 px-3 py-2 text-sm font-semibold text-success hover:bg-success/10"
                >
                    <ClipboardCheck className="h-4 w-4" />
                    Заполнить лист решений
                </a>
            </div>
        </aside>
    );
};
