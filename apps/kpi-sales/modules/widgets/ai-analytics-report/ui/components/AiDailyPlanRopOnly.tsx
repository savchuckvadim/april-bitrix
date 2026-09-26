'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AiMetricValue,
    formatAiRate,
    type AiDailyPlanItem,
    type AiDailyPlanRopOnly as AiDailyPlanRopOnlyData,
} from '@/modules/entities/ai-analytics';
import {
    AI_DAILY_PLAN_BETA_SOURCE,
    AI_DAILY_PLAN_UNREACHABLE,
    aiBindingConstraintLabel,
    formatAiPlanNumber,
} from '../../lib/ai-daily-plan.util';

interface AiDailyPlanRopOnlyProps {
    ropOnly: AiDailyPlanRopOnlyData;
    /** Строки плана — названия рёбер для связующего ограничения. */
    items: AiDailyPlanItem[];
}

/**
 * Служебный блок руководителя (менеджеру не отдаётся): норма входного
 * ребра (leave-one-out, с n и долей своих данных), норма при опорном
 * качестве, режим связи «качество → исход», связующее ограничение,
 * почему цель недостижима, два G′ и S_req.
 */
export const AiDailyPlanRopOnly = ({
    ropOnly,
    items,
}: AiDailyPlanRopOnlyProps) => (
    <section className="rounded-md border border-dashed border-border/60 p-3">
        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
            Только руководителю
            <ToneBadge tone="muted" variant="soft" size="sm">
                служебные числа
            </ToneBadge>
        </h4>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-[auto_1fr]">
            <dt>Норма входного ребра</dt>
            <dd className="text-foreground">
                <AiMetricValue metric={ropOnly.norm} withDetails />
                {ropOnly.norm.w !== undefined && (
                    <span className="ml-2 text-muted-foreground">
                        своих данных {Math.round(ropOnly.norm.w * 100)} %
                    </span>
                )}
            </dd>

            <dt>Норма при опорном качестве</dt>
            <dd className="text-foreground tabular-nums">
                {ropOnly.normAtRefQuality === null
                    ? 'нет — вне режима data'
                    : formatAiRate(ropOnly.normAtRefQuality)}
            </dd>

            <dt>Связь «качество → исход»</dt>
            <dd className="text-foreground">
                {AI_DAILY_PLAN_BETA_SOURCE[ropOnly.betaSource]}
            </dd>

            <dt>Связующее ограничение</dt>
            <dd className="text-foreground">
                {ropOnly.bindingConstraint ? (
                    <HintTooltip
                        title="Упирается в потолок"
                        lines={[
                            'Это ребро первым упирается в потолок дневного темпа: лечить остальные бесполезно.',
                        ]}
                    >
                        <span className="border-b border-dashed border-muted-foreground">
                            {aiBindingConstraintLabel(
                                ropOnly.bindingConstraint,
                                items,
                            )}
                        </span>
                    </HintTooltip>
                ) : (
                    'не упирается в потолок'
                )}
            </dd>

            {ropOnly.unreachable && (
                <>
                    <dt>Цель недостижима</dt>
                    <dd>
                        <ToneBadge tone="destructive" variant="soft" size="sm">
                            {AI_DAILY_PLAN_UNREACHABLE[ropOnly.unreachable]}
                        </ToneBadge>
                    </dd>
                </>
            )}

            <dt>G′ по медиане дневного темпа</dt>
            <dd className="text-foreground tabular-nums">
                {formatAiPlanNumber(ropOnly.gExpected)}
            </dd>
            <dt>G′ по потолку полосы стажа</dt>
            <dd className="text-foreground tabular-nums">
                {formatAiPlanNumber(ropOnly.gCeiling)}
            </dd>

            {ropOnly.sReq !== undefined && (
                <>
                    <dt>S_req — качество для цели текущим объёмом</dt>
                    <dd className="text-foreground tabular-nums">
                        {formatAiPlanNumber(ropOnly.sReq)}
                    </dd>
                </>
            )}
        </dl>
    </section>
);
