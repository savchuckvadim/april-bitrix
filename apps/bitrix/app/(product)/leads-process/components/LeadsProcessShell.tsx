'use client';

import React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Menu } from 'lucide-react';
import { LEADS_PAGE_META, LEADS_SECTIONS } from '../constants/content';
import { useLeadsSidebar } from '../hooks/use-leads-sidebar';
import { LeadsSidebar } from './LeadsSidebar';
import { LeadsMobileNav } from './LeadsMobileNav';
import { LeadsSectionView } from './LeadsSectionView';

/**
 * CRM-рама в стиле admin: sidebar и верхняя панель без границ сливаются
 * на bg-card, контент — скруглённый «остров» на bg-background. Бургер
 * сворачивает sidebar — тогда остров становится шире.
 */
export const LeadsProcessShell: React.FC = () => {
    const { isOpen, toggle } = useLeadsSidebar();

    return (
        <div className="flex h-dvh w-full overflow-hidden bg-card">
            {isOpen && <LeadsSidebar sections={LEADS_SECTIONS} onHide={toggle} />}
            <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex h-14 shrink-0 items-center gap-2 px-4">
                    {!isOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggle}
                            aria-label="Показать меню"
                            title="Показать меню"
                            className="hidden lg:inline-flex"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    )}
                    <p className="truncate text-sm font-semibold text-muted-foreground">
                        {LEADS_PAGE_META.eyebrow}
                    </p>
                </div>
                <div className="min-h-0 flex-1 px-3 pb-3">
                    <main className="h-full min-h-0 overflow-y-auto rounded-xl bg-background">
                        <LeadsMobileNav sections={LEADS_SECTIONS} />
                        <div
                            className={`mx-auto px-4 py-10 sm:px-8 ${
                                isOpen ? 'max-w-6xl' : 'max-w-screen-2xl'
                            }`}
                        >
                            <header className="mb-6 border-b pb-8">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                                    {LEADS_PAGE_META.title}
                                </h1>
                                <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                                    {LEADS_PAGE_META.description}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="border-success/50 text-success"
                                    >
                                        система принципов — утверждаемая
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-primary/50 text-primary"
                                    >
                                        профиль работы — на выбор портала
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-warning/50 text-warning"
                                    >
                                        проверка на дубли — в разработке
                                    </Badge>
                                </div>
                            </header>
                            {LEADS_SECTIONS.map((section) => (
                                <LeadsSectionView
                                    key={section.id}
                                    section={section}
                                />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
