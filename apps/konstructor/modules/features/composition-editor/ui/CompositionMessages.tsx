'use client';

import { isBlocking, type RuleViolation } from '@/modules/entities/composition';

export interface CompositionMessagesProps {
    /** Нарушения текущего состава (подсветка) */
    violations: RuleViolation[];
    /** Отказ последнего действия в режиме правил */
    blocked: RuleViolation[];
    /** Автоправки последнего действия */
    autoFixes: string[];
}

/**
 * Что сказать менеджеру о составе: отказ последнего действия и ошибки состава
 * (красным), предупреждения-подсветка (жёлтым), автоправки (синим). Стоит под
 * списком блоков и прилипает к низу прокрутки: появляясь, не сдвигает чекбоксы,
 * а при длинном списке остаётся на виду.
 */
export const CompositionMessages = ({ violations, blocked, autoFixes }: CompositionMessagesProps) => {
    const errors = [...blocked, ...violations.filter(isBlocking)];
    const warnings = violations.filter(violation => !isBlocking(violation));
    if (!errors.length && !warnings.length && !autoFixes.length) return null;

    return (
        <div className="sticky bottom-0 z-10 flex flex-col gap-2 bg-card py-2 text-xs" aria-live="polite">
            {errors.length ? (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-destructive">
                    {errors.map(violation => (
                        <div key={violation.code}>{violation.message}</div>
                    ))}
                </div>
            ) : null}
            {warnings.length ? (
                <div className="rounded-md bg-warning/10 px-3 py-2 text-warning">
                    {warnings.map(violation => (
                        <div key={violation.code}>{violation.message}</div>
                    ))}
                </div>
            ) : null}
            {autoFixes.length ? (
                <div className="rounded-md bg-info/10 px-3 py-2 text-info">
                    {autoFixes.map(fix => (
                        <div key={fix}>{fix}</div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
