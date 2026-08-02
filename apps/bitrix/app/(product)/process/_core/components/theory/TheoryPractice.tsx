'use client';

import type { FC } from 'react';
import { Quote } from 'lucide-react';

/**
 * Врезка «Как бывает делают» — существующие стратегии без оценок.
 *
 * Нужна, чтобы снять ощущение навязывания: сначала показываем, как встречается
 * на практике и почему так сложилось, и только потом рекомендуем. После этого
 * рекомендация весит больше.
 */
export const TheoryPractice: FC<{ text: string }> = ({ text }) => (
    <aside className="bg-muted/40 rounded-xl p-4">
        <p className="text-muted-foreground flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <Quote className="size-3.5" aria-hidden />
            Как бывает делают
        </p>
        <p className="text-foreground/85 mt-2 text-sm leading-relaxed">
            {text}
        </p>
    </aside>
);
