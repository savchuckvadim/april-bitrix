'use client';

import type { FC } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Врезка «Опасность» — риск и способ его обойти.
 *
 * Узкой полосой слева и без заливки: если красить целиком, страница станет
 * тревожной от края до края и перестанет читаться.
 */
export const TheoryDanger: FC<{ text: string }> = ({ text }) => (
    <aside className="border-destructive/60 border-l-4 py-1 pl-4">
        <p className="text-destructive flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <AlertTriangle className="size-3.5" aria-hidden />
            Опасность
        </p>
        <p className="text-foreground/85 mt-1.5 text-sm leading-relaxed">
            {text}
        </p>
    </aside>
);
