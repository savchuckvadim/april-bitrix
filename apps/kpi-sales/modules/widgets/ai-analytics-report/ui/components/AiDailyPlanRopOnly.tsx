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

const T = AI_DAILY_PLAN_ROP_HINT;

/** Подпись с пунктиром и объяснением в тултипе. */
const Hinted = ({ label, hint }: { label: string; hint: string }) => (
    <HintTooltip title={label} lines={[hint]}>
        <span className="cursor-help border-b border-dashed border-muted-foreground">
            {label}
        </span>
    </HintTooltip>
);

/**
 * Блок руководителя (менеджеру не отдаётся): прогноз месяца при нынешнем
 * темпе и потолок (в деградации — «прогноз не оценён»), обычный максимум
 * звонков портала, норма входного ребра с долей своих данных, норма при
 * опорном качестве, связь качества с результатом, упор в максимум, почему
 * цель недостижима, качество для цели — у каждой строки подсказка словами.
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
                {T.title}
                <HintTooltip title={T.badge} lines={[T.badgeHint]}>
                    <span>
                        <ToneBadge tone="muted" variant="soft" size="sm">
                            {T.badge}
                        </ToneBadge>
                    </span>
                </HintTooltip>
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
                    <Hinted label={T.capLabel} hint={T.cap} />
                </dt>
                <dd className="text-foreground tabular-nums">
                    {formatAiPlanCap(aiDailyPlanCallCap(items))}
                </dd>

                <dt>
                    <Hinted label={T.normLabel} hint={T.norm} />
                </dt>
                <dd className="text-foreground">
                    <AiMetricValue metric={ropOnly.norm} withDetails />
                    {ropOnly.norm.w !== undefined && (
                        <span className="ml-2 text-muted-foreground">
                            <Hinted
                                label={T.ownDataLabel(Math.round(ropOnly.norm.w * 100))}
                                hint={T.ownData}
                            />
                        </span>
                    )}
                </dd>

                <dt>
                    <Hinted label={T.normAtRefLabel} hint={T.normAtRef} />
                </dt>
                <dd className="text-foreground tabular-nums">
                    {ropOnly.normAtRefQuality === null
                        ? 'нет — связь с качеством не оценена'
                        : formatAiRate(ropOnly.normAtRefQuality)}
                </dd>

                <dt>
                    <Hinted label={T.betaLabel} hint={T.beta} />
                </dt>
                <dd className="text-foreground">
                    {AI_DAILY_PLAN_BETA_SOURCE[ropOnly.betaSource]}
                </dd>

                <dt>{T.bindingLabel}</dt>
                <dd className="text-foreground">
                    {ropOnly.bindingConstraint ? (
                        <Hinted
                            label={aiBindingConstraintLabel(
                                ropOnly.bindingConstraint,
                                items,
                            )}
                            hint={T.binding}
                        />
                    ) : (
                        'нет'
                    )}
                </dd>

                {ropOnly.unreachable && (
                    <>
                        <dt>{T.unreachableLabel}</dt>
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
                            <Hinted label={T.sReqLabel} hint={T.sReq} />
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
