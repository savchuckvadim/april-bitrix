'use client';

import type { FC } from 'react';
import { Lightbulb } from 'lucide-react';

interface TheoryObviousProps {
    intuition: string;
    reality: string;
    consequence: string;
}

/**
 * Врезка «Кажется очевидным».
 *
 * Три такта в жёстком порядке: во что верится → как на самом деле → чем это
 * оборачивается. Спокойная, не тревожная: здесь никого не пугают, здесь
 * переворачивают привычную мысль.
 */
export const TheoryObvious: FC<TheoryObviousProps> = ({
    intuition,
    reality,
    consequence,
}) => (
    <aside className="border-info/40 bg-info/5 rounded-xl border-l-4 p-4">
        <p className="text-info flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <Lightbulb className="size-3.5" aria-hidden />
            Кажется очевидным
        </p>

        <dl className="mt-2.5 space-y-2 text-sm leading-relaxed">
            <div>
                <dt className="text-muted-foreground text-xs font-semibold">
                    Хочется подумать
                </dt>
                <dd className="text-foreground/90">{intuition}</dd>
            </div>
            <div>
                <dt className="text-info text-xs font-semibold">
                    На самом деле
                </dt>
                <dd className="text-foreground font-medium">{reality}</dd>
            </div>
            <div>
                <dt className="text-muted-foreground text-xs font-semibold">
                    Чем это оборачивается
                </dt>
                <dd className="text-foreground/90">{consequence}</dd>
            </div>
        </dl>
    </aside>
);
