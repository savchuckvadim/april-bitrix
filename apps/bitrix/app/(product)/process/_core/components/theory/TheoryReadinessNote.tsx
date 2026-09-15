import type { FC } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import {
    THEORY_READINESS,
    THEORY_READINESS_HINT,
} from '../../constants/theory-copy';
import { renderInline } from '../../lib/render-inline';
import type { TheoryReadiness } from '../../theory-types';

interface TheoryReadinessNoteProps {
    state: TheoryReadiness;
    text: string;
}

/**
 * Плашка готовности главы.
 *
 * Отличается от `ReadinessBadge`: та молчит про «работает» и помечает только
 * недописанное, а здесь читатель справочника должен видеть все три состояния
 * — иначе «работает» и «открыто» выглядят одинаково.
 */
export const TheoryReadinessNote: FC<TheoryReadinessNoteProps> = ({
    state,
    text,
}) => {
    const readiness = THEORY_READINESS[state];

    return (
        <aside
            className="bg-muted/30 flex flex-wrap items-start gap-3 rounded-xl border px-4 py-3"
            aria-label={readiness.label}
        >
            <span
                title={THEORY_READINESS_HINT[state]}
                className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-widest uppercase',
                    readiness.className,
                )}
            >
                {readiness.label}
            </span>
            <p className="text-foreground/85 min-w-0 flex-1 text-sm leading-relaxed">
                {renderInline(text)}
            </p>
        </aside>
    );
};
