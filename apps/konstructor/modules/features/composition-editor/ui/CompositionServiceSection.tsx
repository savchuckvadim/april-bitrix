'use client';

import type { ReactNode } from 'react';

export interface CompositionServiceSectionProps {
    title: string;
    children: ReactNode;
}

/** Блок одного сервиса под списком блоков: консалтинг, СТАР, академия. */
export const CompositionServiceSection = ({ title, children }: CompositionServiceSectionProps) => (
    <section className="flex min-w-0 flex-col gap-2 rounded-lg border p-3">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{title}</h3>
        {children}
    </section>
);
