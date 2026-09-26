'use client';

import type { AiDailyPlan } from '@/modules/entities/ai-analytics';
import type { AiDailyPlanView } from '../../lib/ai-daily-plan-view.util';
import { AiDailyPlanNoTarget } from './AiDailyPlanNoTarget';
import { AiDailyPlanTarget } from './AiDailyPlanTarget';
import { AiDailyPlanItemsTable } from './AiDailyPlanItemsTable';
import { AiDailyPlanExplanation } from './AiDailyPlanExplanation';
import { AiDailyPlanRopOnly } from './AiDailyPlanRopOnly';

interface AiDailyPlanBodyProps {
    plan: AiDailyPlan;
    view: AiDailyPlanView;
    /** Открыть настройки на «Цели по уровням» (руководителю с правами). */
    onOpenTargets?: () => void;
}

/**
 * Готовый план дня: цели нет — пустое состояние с фактом месяца и тем, что
 * нужно для плана; иначе простой заголовок, цель, строки в порядке воронки,
 * «Как посчитано» (формулы свёрнуты) и служебный блок руководителя.
 */
export const AiDailyPlanBody = ({
    plan,
    view,
    onOpenTargets,
}: AiDailyPlanBodyProps) => {
    if (view.state === 'no-target') {
        return (
            <AiDailyPlanNoTarget view={view} onOpenTargets={onOpenTargets} />
        );
    }

    return (
        <div className="space-y-5">
            <p className="text-sm font-medium">{view.headline}</p>
            <AiDailyPlanTarget plan={plan} />
            <AiDailyPlanItemsTable rows={view.rows} />
            <AiDailyPlanExplanation explanation={plan.explanation} />
            {plan.ropOnly && (
                <AiDailyPlanRopOnly
                    ropOnly={plan.ropOnly}
                    items={plan.items}
                    forecast={view.forecast}
                    forecastNote={view.forecastNote}
                />
            )}
        </div>
    );
};
