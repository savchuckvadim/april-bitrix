import React from 'react';
import { HowPageContent } from '../constants/types';
import { HowBlockList } from './blocks/HowBlockList';
import { HowPageCta } from './HowPageCta';

interface HowContentPageProps {
    page: HowPageContent;
}

/** Каркас контентной страницы раздела: шапка, блоки, CTA. */
export const HowContentPage: React.FC<HowContentPageProps> = ({ page }) => (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <header className="mb-10">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                {page.eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                {page.title}
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
                {page.description}
            </p>
        </header>

        <HowBlockList blocks={page.blocks} />

        {page.cta && <HowPageCta cta={page.cta} />}
    </article>
);
