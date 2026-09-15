'use client';

import type { FC } from 'react';
import { ProcessShell } from '../ProcessShell';
import { SectionNav } from '../SectionNav';
import type { SectionDefinition } from '../../section/section-definition';
import type { TheoryPageContent } from '../../theory-types';
import { TheoryBlockRenderer } from './TheoryBlockRenderer';

interface TheoryOverviewViewProps {
    page: TheoryPageContent;
    /** Подпись над карточками «куда дальше». */
    navTitle: string;
    /** Раздел, в раме которого показать обзор; не задан — продажи. */
    definition?: SectionDefinition;
}

/**
 * Обзорная страница раздела.
 *
 * Первое, что видит человек, и единственная страница, которая объясняет, зачем
 * читать остальные. Заканчивается навигацией карточками: дочитал — сразу видно,
 * куда идти дальше, без возврата в боковое меню.
 */
export const TheoryOverviewView: FC<TheoryOverviewViewProps> = ({
    page,
    navTitle,
    definition,
}) => (
    <ProcessShell
        eyebrow={page.eyebrow}
        title={page.title}
        definition={definition}
    >
        <article className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
            <header className="mb-8 border-b pb-6">
                <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                    {page.title}
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">
                    {page.description}
                </p>
            </header>

            <div className="space-y-5">
                {page.blocks.map((block, index) => (
                    <TheoryBlockRenderer key={index} block={block} />
                ))}
            </div>

            <div className="mt-10 border-t pt-6">
                <p className="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">
                    {navTitle}
                </p>
                <SectionNav currentSlug={page.slug} />
            </div>
        </article>
    </ProcessShell>
);
