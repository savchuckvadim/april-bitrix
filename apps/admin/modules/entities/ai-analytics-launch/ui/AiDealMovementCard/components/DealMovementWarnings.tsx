'use client';

import { DEAL_MOVEMENT_TEXT } from '../../../consts/deal-movement.const';

interface DealMovementWarningsProps {
    warnings: readonly string[];
}

/** Предупреждения счёта (потолок сделок, недочитанная история) — как есть. */
export const DealMovementWarnings = ({ warnings }: DealMovementWarningsProps) => {
    if (warnings.length === 0) return null;
    return (
        <div className="space-y-1 text-xs text-warning">
            <p className="font-medium">{DEAL_MOVEMENT_TEXT.warningsTitle}</p>
            <ul className="list-disc space-y-0.5 pl-4">
                {warnings.map(warning => (
                    <li key={warning}>{warning}</li>
                ))}
            </ul>
        </div>
    );
};
