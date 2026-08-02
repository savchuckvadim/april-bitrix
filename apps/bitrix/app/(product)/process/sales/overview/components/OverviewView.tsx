'use client';

import type { FC } from 'react';
import { ProcessShell } from '../../../_core/components/ProcessShell';
import { SectionNav } from '../../../_core/components/SectionNav';
import { TheoryBlockRenderer } from '../../../_core/components/theory/TheoryBlockRenderer';
import { SALES_OVERVIEW } from '../constants/overview';

/**
 * Обзорная страница раздела.
 *
 * Первое, что видит человек, и единственная страница, которая объясняет, зачем
 * читать остальные. Заканчивается навигацией карточками: дочитал — сразу видно,
 * куда идти дальше, без возврата в боковое меню.
 */
export const OverviewView: FC = () => (
    <ProcessShell eyebrow={SALES_OVERVIEW.eyebrow} title={SALES_OVERVIEW.title}>
        <article className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
            <header className="mb-8 border-b pb-6">
                <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                    {SALES_OVERVIEW.title}
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">
                    {SALES_OVERVIEW.description}
                </p>
            </header>

            <div className="space-y-5">
                {SALES_OVERVIEW.blocks.map((block, index) => (
                    <TheoryBlockRenderer key={index} block={block} />
                ))}
            </div>

            <div className="mt-10 border-t pt-6">
                <p className="text-muted-foreground mb-3 text-xs font-bold tracking-widest uppercase">
                    С чего начать
                </p>
                <SectionNav />
            </div>
        </article>
    </ProcessShell>
);
