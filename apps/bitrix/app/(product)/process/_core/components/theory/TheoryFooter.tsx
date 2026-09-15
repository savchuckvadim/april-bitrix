'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSection } from '../../hooks/use-section';
import { findTabIndex } from '../../section/section-definition';

/**
 * Подвал повествовательной страницы: предыдущая и следующая части.
 *
 * Порядок берётся из того же списка, что рисует боковое меню, — иначе подписи
 * разъезжаются с реальным порядком чтения. Раньше здесь стояло жёсткое
 * «вернуться к схеме процесса», и после перестановки разделов оно начало врать:
 * схема теперь идёт ПОСЛЕ теории, а не до неё.
 */
export const TheoryFooter: FC<{ slug: string }> = ({ slug }) => {
    const { definition, tabs, tabPath } = useSection();
    const index = findTabIndex(definition, slug);
    const previous = index > 0 ? tabs[index - 1] : undefined;
    const next =
        index >= 0 && index < tabs.length - 1 ? tabs[index + 1] : undefined;

    return (
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            {previous ? (
                <Link
                    href={tabPath(previous.slug)}
                    className="text-muted-foreground hover:text-foreground focus-visible:outline-primary flex items-center gap-2 rounded-md text-sm focus-visible:outline-2"
                >
                    <ArrowLeft className="size-4" aria-hidden />
                    Назад: {previous.label}
                </Link>
            ) : (
                <span />
            )}

            {next && (
                <Link
                    href={tabPath(next.slug)}
                    className="text-primary focus-visible:outline-primary flex items-center gap-2 rounded-md text-sm font-semibold hover:underline focus-visible:outline-2"
                >
                    Дальше: {next.label}
                    <ArrowRight className="size-4" aria-hidden />
                </Link>
            )}
        </footer>
    );
};
