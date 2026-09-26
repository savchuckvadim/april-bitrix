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
    AI_DAILY_PLAN_TARGET_SOURCE,
    AI_DAILY_PLAN_TARGET_WARNING,
    aiSalesLeft,
    formatAiPipelineExpected,
    formatAiPlanNumber,
    formatAiRequiredVolume,
} from '../../lib/ai-daily-plan.util';

interface AiDailyPlanTargetProps {
    plan: AiDailyPlan;
}

const DAY_FORMS = ['рабочий день', 'рабочих дня', 'рабочих дней'] as const;
const SALE_FORMS = ['сделка', 'сделки', 'сделок'] as const;

/**
 * Цель месяца и прогресс к ней: G с источником и оговорками, закрыто Y₀
 * (полоса), до цели за оставшиеся рабочие дни, ожидание из пайплайна
 * λ_pipe (null — истории стадий нет, не ноль) и требуемый объём N_req
 * (null — причина из reason).
 */
export const AiDailyPlanTarget = ({ plan }: AiDailyPlanTargetProps) => {
    const { target } = plan;
    const share = aiPlanShare(plan.doneSales, target.sales);
    const left = aiSalesLeft(plan);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Цель месяца
                    </p>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl font-semibold tabular-nums">
                            {formatAiCount(target.sales)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {pluralRu(target.sales, SALE_FORMS)}
                        </span>
                        <ToneBadge tone="muted" variant="soft" size="sm">
                            {AI_DAILY_PLAN_TARGET_SOURCE[target.source]}
                        </ToneBadge>
                    </div>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <dt>До цели</dt>
                    <dd className="text-foreground tabular-nums">
                        {formatAiPlanNumber(left)} за {plan.daysLeft}{' '}
                        {pluralRu(plan.daysLeft, DAY_FORMS)}
                    </dd>
                    <dt>Ожидание из пайплайна</dt>
                    <dd className="text-foreground tabular-nums">
                        {plan.pipelineExpected === null ? (
                            <HintTooltip
                                title="λ_pipe не оценено"
                                lines={[
                                    'Истории стадий нет — цель на пайплайн не уменьшается: ноль означал бы «пайплайн пуст», а это неправда.',
                                ]}
                            >
                                <span className="border-b border-dashed border-muted-foreground">
                                    {formatAiPipelineExpected(null)}
                                </span>
                            </HintTooltip>
                        ) : (
                            formatAiPipelineExpected(plan.pipelineExpected)
                        )}
                    </dd>
                    <dt>Требуемый объём</dt>
                    <dd className="text-foreground tabular-nums">
                        {formatAiRequiredVolume(
                            plan.requiredVolume,
                            plan.reason,
                        )}
                    </dd>
                </dl>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                        закрыто {formatAiCount(plan.doneSales)} из{' '}
                        {formatAiCount(target.sales)}
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
