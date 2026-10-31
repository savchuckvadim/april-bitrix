'use client';

import { cn } from '@workspace/ui/lib/utils';
import type { WeightMarkValue } from '../lib/composition-sections.util';
import { weightDots } from '../lib/composition-view.util';
import type { WeightMarkKind } from '../model/types';

export interface WeightMarkProps {
    value: WeightMarkValue;
    kind: WeightMarkKind;
}

const BASE = 'ml-auto shrink-0 pl-2 text-[0.6875rem] leading-none tabular-nums';

/** Вес блока: числом, точками или микро-меткой; ЭР внутри пакета веса не имеет. */
export const WeightMark = ({ value, kind }: WeightMarkProps) => {
    if (value === null) return null;
    if (value === 'in-packet') {
        return <span className={cn(BASE, 'text-muted-foreground')}>в пакете</span>;
    }
    if (kind === 'dots') {
        return (
            <span className={cn(BASE, 'inline-flex gap-0.5')} title={`Вес ${value}`}>
                {weightDots(value).map((dot, index) => (
                    <span
                        key={index}
                        aria-hidden
                        className={cn(
                            'size-1.5 rounded-full',
                            dot === 'full'
                                ? 'bg-primary'
                                : 'bg-[linear-gradient(90deg,var(--primary)_50%,var(--border)_50%)]',
                        )}
                    />
                ))}
                <span className="sr-only">Вес {value}</span>
            </span>
        );
    }
    if (kind === 'tag') {
        return (
            <span className="ml-auto shrink-0 rounded bg-muted px-1 py-0.5 text-[0.625rem] leading-none font-medium text-muted-foreground tabular-nums">
                {value}
            </span>
        );
    }
    return <span className={cn(BASE, 'text-muted-foreground')}>{value}</span>;
};
