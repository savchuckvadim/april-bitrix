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
    aiDailyPlanCallCap,
    formatAiPlanCap,
    formatAiPlanNumber,
} from '../../lib/ai-daily-plan.util';
import type { AiDailyPlanForecastView } from '../../lib/ai-daily-plan-forecast.util';
import { AI_DAILY_PLAN_ROP_HINT } from '../../lib/ai-daily-plan-activity.data';
import { AiDailyPlanForecastRows } from './AiDailyPlanForecast';

interface AiDailyPlanRopOnlyProps {
    ropOnly: AiDailyPlanRopOnlyData;
    /** Строки плана — названия рёбер и обычный максимум звонков. */
    items: AiDailyPlanItem[];
    /** Прогноз месяца (view.forecast); null — не оценён. */
    forecast: AiDailyPlanForecastView | null;
    /** «Прогноз не оценён — …» (view.forecastNote). */
    forecastNote: string | null;
}

/** Подпись с пунктиром и объяснением в тултипе. */
const Hinted = ({ label, hint }: { label: string; hint: string }) => (
    <HintTooltip title={label} lines={[hint]}>
        <span className="border-b border-dashed border-muted-foreground">
            {label}
        </span>
    </HintTooltip>
);

/**
 * Служебный блок руководителя (менеджеру не отдаётся): прогноз месяца
 * при нынешнем темпе и потолок (в деградации — «прогноз не оценён»),
 * обычный максимум звонков портала (cap), норма входного ребра
 * (leave-one-out, с n и долей своих данных), норма при опорном качестве,
 * связь «качество → исход», упор в cap, почему цель недостижима, S_req.
 */
export const AiDailyPlanRopOnly = ({
    ropOnly,
    items,
    forecast,
    forecastNote,
}: AiDailyPlanRopOnlyProps) => {
    return (
        <section className="rounded-md border border-dashed border-border/60 p-3">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                Только руководителю
                <ToneBadge tone="muted" variant="soft" size="sm">
                    служебные числа
                </ToneBadge>
            </h4>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-[auto_1fr]">
                {forecast && <AiDailyPlanForecastRows forecast={forecast} />}
                {!forecast && forecastNote && (
                    <>
                        <dt>Прогноз месяца</dt>
                        <dd className="text-foreground">{forecastNote}</dd>
                    </>
                )}

                <dt>
                    <Hinted
                        label={AI_DAILY_PLAN_ROP_HINT.capLabel}
                        hint={AI_DAILY_PLAN_ROP_HINT.cap}
                    />
                </dt>
                <dd className="text-foreground tabular-nums">
                    {formatAiPlanCap(aiDailyPlanCallCap(items))}
                </dd>

                <dt>Норма конверсии на входе воронки</dt>
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
                        ? 'нет — связь с качеством не оценена'
                        : formatAiRate(ropOnly.normAtRefQuality)}
                </dd>

                <dt>Связь «качество → исход»</dt>
                <dd className="text-foreground">
                    {AI_DAILY_PLAN_BETA_SOURCE[ropOnly.betaSource]}
                </dd>

                <dt>{AI_DAILY_PLAN_ROP_HINT.bindingLabel}</dt>
                <dd className="text-foreground">
                    {ropOnly.bindingConstraint ? (
                        <Hinted
                            label={aiBindingConstraintLabel(
                                ropOnly.bindingConstraint,
                                items,
                            )}
                            hint={AI_DAILY_PLAN_ROP_HINT.binding}
                        />
                    ) : (
                        'нет'
                    )}
                </dd>

                {ropOnly.unreachable && (
                    <>
                        <dt>Цель недостижима</dt>
                        <dd>
                            <ToneBadge
                                tone="destructive"
                                variant="soft"
                                size="sm"
                            >
                                {AI_DAILY_PLAN_UNREACHABLE[ropOnly.unreachable]}
                            </ToneBadge>
                        </dd>
                    </>
                )}

                {ropOnly.sReq !== undefined && (
                    <>
                        <dt>
                            Качество, при котором цель берётся текущим объёмом
                        </dt>
                        <dd className="text-foreground tabular-nums">
                            {formatAiPlanNumber(ropOnly.sReq)}
                        </dd>
                    </>
                )}
            </dl>
        </section>
    );
};
