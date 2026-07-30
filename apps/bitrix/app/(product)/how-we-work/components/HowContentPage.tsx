import React from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { ArrowRight } from 'lucide-react';
import { HowPageContent } from '../constants/types';
import { HowBlockRenderer } from './blocks/HowBlockRenderer';

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

        <div className="space-y-6">
            {page.blocks.map((block, index) => (
                <HowBlockRenderer key={index} block={block} />
            ))}
        </div>

        {page.cta && (
            <footer className="mt-14 rounded-xl border bg-card p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold text-foreground">
                            {page.cta.label}
                        </p>
                        {page.cta.note && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {page.cta.note}
                            </p>
                        )}
                    </div>
                    <Button asChild size="lg">
                        <Link href={page.cta.href}>
                            Продолжить
                            <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </footer>
        )}
    </article>
);
