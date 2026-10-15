'use client';

import { LiquidProgress } from '@workspace/april-ui';
import { formatPlanPercent, formatPlanValue, planTone } from '@/modules/feature/plans';
import type { PlanUnit } from '@/modules/feature/plans/model';
import type { DigestPlanCell as DigestPlanCellValue } from '../../lib/digest-plan-fact.util';

interface DigestPlanCellProps {
    cell: DigestPlanCellValue;
    unit: PlanUnit;
    /** Ожидаемая доля к «сейчас» (риска на полосе). */
    expected: number;
}

/**
 * Ячейка связки за день: «факт / план руководителя · %» с прогрессом и
 * строкой «в CRM на день N · конверсия плана %». Без цели — только факт.
 */
export const DigestPlanCell = ({ cell, unit, expected }: DigestPlanCellProps) => (
    <div className="min-w-[160px] space-y-1">
        <div className="flex items-baseline justify-between gap-2 text-xs">
            <span className="font-medium">
                {formatPlanValue(cell.fact, unit)}
                <span className="text-muted-foreground">
                    {' '}
                    / {cell.plan === null ? 'план не задан' : formatPlanValue(cell.plan, unit)}
                </span>
            </span>
            {cell.plan !== null && (
                <span className="font-semibold">{formatPlanPercent(cell.percent)}</span>
            )}
        </div>
        {cell.plan !== null && (
            <LiquidProgress
                value={cell.percent ?? 0}
                expected={expected}
                tone={planTone(cell.percent, expected)}
                size="sm"
            />
        )}
        {cell.crmPlanned !== null && (
            <p className="text-[0.6875rem] leading-snug text-muted-foreground">
                в CRM на день {formatPlanValue(cell.crmPlanned, unit)}
                {cell.crmPercent !== null && (
                    <>
                        {' · '}
                        конверсия плана{' '}
                        <span className="font-medium text-foreground">
                            {formatPlanPercent(cell.crmPercent)}
                        </span>
                    </>
                )}
            </p>
        )}
    </div>
);
