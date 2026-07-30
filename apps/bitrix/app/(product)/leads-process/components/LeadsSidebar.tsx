'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeft, ClipboardCheck, Menu } from 'lucide-react';
import { LeadsSection } from '../constants/types';
import { useScrollspy } from '../hooks/use-scrollspy';

interface LeadsSidebarProps {
    sections: LeadsSection[];
    /** Свернуть сайдбар (бургер справа от бренда) */
    onHide: () => void;
}

/**
 * Левый sidebar CRM-рамы: бренд April Crm с бургером, навигация по секциям
 * и быстрый переход к листу решений. Без фона и границ — сливается
 * с рамой (bg-card задаёт shell).
 */
export const LeadsSidebar: React.FC<LeadsSidebarProps> = ({
    sections,
    onHide,
}) => {
    const activeId = useScrollspy(sections.map((section) => section.id));

    return (
        <aside className="hidden h-full w-64 shrink-0 flex-col lg:flex">
            <div className="flex h-14 shrink-0 items-center justify-between pl-6 pr-2">
                <Link
                    href="/"
                    className="text-base font-bold tracking-tight text-foreground"
                >
                    April <span className="text-primary">Crm</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onHide}
                    aria-label="Скрыть меню"
                    title="Скрыть меню"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4 pt-2">
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
