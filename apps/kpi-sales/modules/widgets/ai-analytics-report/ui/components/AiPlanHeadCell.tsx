'use client';

import type { AiPlanTargetCell } from '@/modules/entities/ai-analytics';
import { PlanProgressCell, formatPlanValue } from '@/modules/feature/plans';
import { AI_PLAN_HEAD_TEXT, aiPlanHeadCells } from '../../lib/ai-plan-head.util';

interface AiPlanHeadCellProps {
    /** row.planTargets; undefined — строка из сохранённого расчёта без поля. */
    targets: AiPlanTargetCell[] | undefined;
    /** Ожидаемая доля выполнения к «сейчас» — риска на полосе. */
    expected: number;
}

/**
 * «План руководителя»: по включённому показателю с планом — «факт / план · %»
 * и полоса, тот же вид, что в блоке «Планы» вкладки KPI. Факт, который
 * вкладка AI не грузит (эфирное время, звонки по длительности), — честная
 * подпись вместо нуля.
 */
export const AiPlanHeadCell = ({ targets, expected }: AiPlanHeadCellProps) => {
    if (targets === undefined) {
        return (
            <span className="text-xs text-muted-foreground">
                {AI_PLAN_HEAD_TEXT.unknown}
            </span>
        );
    }
    const cells = aiPlanHeadCells(targets);
    if (!cells.length) {
        return (
            <span className="text-xs text-muted-foreground">
                {AI_PLAN_HEAD_TEXT.none}
            </span>
        );
    }
    return (
        <div className="space-y-1.5">
            {cells.map(cell => (
                <div key={cell.code}>
                    <p className="text-[0.6875rem] text-muted-foreground">
                        {cell.name}
                    </p>
                    {cell.fact === null ? (
                        <p className="text-xs text-muted-foreground">
                            {formatPlanValue(cell.plan, cell.unit)} ·{' '}
                            {AI_PLAN_HEAD_TEXT.factMissing}
                        </p>
                    ) : (
                        <PlanProgressCell
                            cell={{
                                code: cell.code,
                                plan: cell.plan,
                                fact: cell.fact,
                                percent: cell.percent,
                            }}
                            unit={cell.unit}
                            expected={expected}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
