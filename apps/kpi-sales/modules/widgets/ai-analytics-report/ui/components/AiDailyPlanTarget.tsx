'use client';

import { HintTooltip, LiquidProgress, ToneBadge } from '@workspace/april-ui';
import {
    aiPlanShare,
    aiPlanTone,
    formatAiCount,
    pluralRu,
    type AiDailyPlan,
} from '@/modules/entities/ai-analytics';
import {
    AI_DAILY_PLAN_REASON,
    AI_DAILY_PLAN_TARGET_SOURCE,
    AI_DAILY_PLAN_TARGET_WARNING,
    aiSalesToClose,
    formatAiPipelineExpected,
} from '../../lib/ai-daily-plan.util';
import { aiDailyPlanHasGoal } from '../../lib/ai-daily-plan-view.util';
import {
    AI_DAILY_PLAN_DAY_FORMS,
    AI_DAILY_PLAN_PIPELINE_HINT,
    AI_DAILY_PLAN_SALE_FORMS,
} from '../../lib/ai-daily-plan-activity.data';

interface AiDailyPlanTargetProps {
    plan: AiDailyPlan;
}

/**
 * Цель месяца и прогресс к ней: G с источником и оговорками (источник и
 * «из G» — только когда цель > 0), сколько осталось закрыть за оставшиеся
 * рабочие дни, сколько ещё принесут сделки в работе (λ_pipe; null —
 * истории стадий нет, не ноль) и причина упрощённого расчёта.
 */
export const AiDailyPlanTarget = ({ plan }: AiDailyPlanTargetProps) => {
    const { target } = plan;
    const hasGoal = aiDailyPlanHasGoal(plan);
    const share = aiPlanShare(plan.doneSales, target.sales);
    const toClose = aiSalesToClose(plan);
    const pipelineKnown = plan.pipelineExpected !== null;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Цель месяца
                    </p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        {hasGoal ? (
                            <>
                                <span className="text-3xl font-semibold tabular-nums">
                                    {formatAiCount(target.sales)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {pluralRu(
                                        target.sales,
                                        AI_DAILY_PLAN_SALE_FORMS,
                                    )}
                                </span>
                                <ToneBadge
                                    tone="muted"
                                    variant="soft"
                                    size="sm"
                                >
                                    {AI_DAILY_PLAN_TARGET_SOURCE[target.source]}
                                </ToneBadge>
                            </>
                        ) : (
                            <span className="text-sm text-muted-foreground">
                                не задана
                            </span>
                        )}
                    </div>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {hasGoal && (
                        <>
                            <dt>Осталось закрыть</dt>
                            <dd className="text-foreground tabular-nums">
                                {toClose}{' '}
                                {pluralRu(toClose, AI_DAILY_PLAN_SALE_FORMS)} за{' '}
                                {plan.daysLeft}{' '}
                                {pluralRu(
                                    plan.daysLeft,
                                    AI_DAILY_PLAN_DAY_FORMS,
                                )}
                            </dd>
                        </>
                    )}
                    <dt>
                        <HintTooltip
                            title="Ещё принесут сделки в работе"
                            lines={[
                                pipelineKnown
                                    ? AI_DAILY_PLAN_PIPELINE_HINT.known
                                    : AI_DAILY_PLAN_PIPELINE_HINT.unknown,
                            ]}
                        >
                            <span className="border-b border-dashed border-muted-foreground">
                                Ещё принесут сделки в работе
                            </span>
                        </HintTooltip>
                    </dt>
                    <dd className="text-foreground tabular-nums">
                        {formatAiPipelineExpected(plan.pipelineExpected)}
                    </dd>
                    {plan.reason && (
                        <>
                            <dt>Расчёт</dt>
                            <dd className="text-foreground">
                                {AI_DAILY_PLAN_REASON[plan.reason]}
                            </dd>
                        </>
                    )}
                </dl>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                        закрыто {formatAiCount(plan.doneSales)}
                        {hasGoal && ` из ${formatAiCount(target.sales)}`}
                    </span>
                    {share !== null && <span>{Math.round(share * 100)} %</span>}
                </div>
                {share !== null && (
                    <LiquidProgress
                        value={share}
                        tone={aiPlanTone(share)}
                        size="sm"
                    />
                )}
            </div>

            {target.warnings.length > 0 && (
                <ul className="space-y-1 text-xs">
                    {target.warnings.map(code => (
                        <li key={code} className="flex items-center gap-2">
                            <ToneBadge tone="warning" variant="soft" size="sm">
                                цель
                            </ToneBadge>
                            <span className="text-muted-foreground">
                                {AI_DAILY_PLAN_TARGET_WARNING[code]}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
