'use client';

import { isBlocking, type RuleResult } from '@/modules/entities/composition';

export interface CompositionMessagesProps {
    result: RuleResult | null;
}

/**
 * Что сказал движок правил на последнее действие: блокирующие нарушения
 * (красным), предупреждения-подсветка (жёлтым) и автоправки.
 */
export const CompositionMessages = ({ result }: CompositionMessagesProps) => {
    if (!result?.violations.length && !result?.autoFixes.length) return null;

    const errors = result.violations.filter(isBlocking);
    const warnings = result.violations.filter(violation => !isBlocking(violation));

    return (
        <div className="flex flex-col gap-2 text-xs">
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
            {result.autoFixes.length ? (
                <div className="rounded-md bg-info/10 px-3 py-2 text-info">
                    {result.autoFixes.map(fix => (
                        <div key={fix}>{fix}</div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
