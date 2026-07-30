import React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { LEADS_PAGE_META, LEADS_SECTIONS } from '../constants/content';
import { LeadsSidebar } from './LeadsSidebar';
import { LeadsMobileNav } from './LeadsMobileNav';
import { LeadsSectionView } from './LeadsSectionView';

/** Рабочая область страницы: sidebar слева, контент во всю ширину. */
export const LeadsProcessShell: React.FC = () => (
    <div className="flex min-h-screen bg-background">
        <LeadsSidebar sections={LEADS_SECTIONS} />
        <div className="min-w-0 flex-1">
            <LeadsMobileNav sections={LEADS_SECTIONS} />
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
                <header className="mb-6 border-b pb-8">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                        {LEADS_PAGE_META.eyebrow}
                    </p>
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
                    <LeadsSectionView key={section.id} section={section} />
                ))}
            </div>
        </div>
    </div>
);
