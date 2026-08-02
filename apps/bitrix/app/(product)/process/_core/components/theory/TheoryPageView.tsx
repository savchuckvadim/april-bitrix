'use client';

import type { FC } from 'react';
import { ProcessShell } from '../ProcessShell';
import type { TheoryPageContent } from '../../theory-types';
import { TheoryBlockRenderer } from './TheoryBlockRenderer';
import { TheoryFooter } from './TheoryFooter';

/**
 * Страница раздела «Теория»: связный рассказ с врезками.
 *
 * Ширина ограничена намеренно — это текст, а не схема: длинная строка убивает
 * читаемость быстрее, чем что-либо ещё.
 */
export const TheoryPageView: FC<{ page: TheoryPageContent }> = ({ page }) => (
    <ProcessShell eyebrow={page.eyebrow} title={page.title}>
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

            <TheoryFooter slug={page.slug} />
        </article>
    </ProcessShell>
);
