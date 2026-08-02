import type { FC } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { SALES_TABS, salesTabPath } from '../constants/views';

/**
 * Навигация по разделу карточками.
 *
 * Обзорная страница обязана заканчиваться выбором «куда дальше»: человек
 * дочитал, понял, зачем это, — и должен попасть в нужную часть, не возвращаясь
 * в боковое меню. На телефоне меню и вовсе лента вкладок, которую легко
 * пролистать мимо.
 */
export const SectionNav: FC<{ currentSlug?: string }> = ({
    currentSlug = '',
}) => (
    <nav aria-label="Разделы документа" className="grid gap-3 sm:grid-cols-2">
        {SALES_TABS.filter(tab => tab.slug !== currentSlug).map(
            (tab, index) => (
                <Link
                    key={tab.slug || 'root'}
                    href={salesTabPath(tab.slug)}
                    className="focus-visible:outline-primary rounded-2xl focus-visible:outline-2"
                >
                    <GlassCard
                        intensity="soft"
                        className="hover:border-primary/50 h-full p-4 transition-colors"
                    >
                        <p className="text-muted-foreground text-[11px] font-bold tracking-widest uppercase">
                            Часть {index + 1}
                        </p>
                        <p className="text-foreground mt-1 flex items-center gap-2 font-semibold">
                            {tab.label}
                            <ArrowRight className="text-primary size-4" />
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                            {tab.hint}
                        </p>
                    </GlassCard>
                </Link>
            ),
        )}
    </nav>
);
