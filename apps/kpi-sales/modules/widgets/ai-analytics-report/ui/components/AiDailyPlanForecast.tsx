'use client';

import { Fragment } from 'react';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_DAILY_PLAN_FORECAST_HINT,
    AI_DAILY_PLAN_FORECAST_LABEL,
} from '../../lib/ai-daily-plan-activity.data';
import type { AiDailyPlanForecastView } from '../../lib/ai-daily-plan-forecast.util';

interface AiDailyPlanForecastRowsProps {
    forecast: AiDailyPlanForecastView;
}

interface AiDailyPlanForecastProps {
    /** Числа прогноза; null — прогноз не оценён (тогда есть note). */
    forecast: AiDailyPlanForecastView | null;
    /** «Прогноз не оценён — …»; null — числа есть. */
    note: string | null;
}

const KEYS = ['expected', 'best'] as const;

/** Пары dt/dd прогноза месяца — для любого списка <dl> (служебный блок, «цели нет»). */
export const AiDailyPlanForecastRows = ({
    forecast,
}: AiDailyPlanForecastRowsProps) => (
    <>
        {KEYS.map(key => (
            <Fragment key={key}>
                <dt>
                    <HintTooltip
                        title={AI_DAILY_PLAN_FORECAST_LABEL[key]}
                        lines={[AI_DAILY_PLAN_FORECAST_HINT[key]]}
                    >
                        <span className="border-b border-dashed border-muted-foreground">
                            {AI_DAILY_PLAN_FORECAST_LABEL[key]}
                        </span>
                    </HintTooltip>
                </dt>
                <dd className="font-medium text-foreground tabular-nums">
                    {forecast[key]}
                </dd>
            </Fragment>
        ))}
    </>
);

/**
 * Прогноз месяца руководителю, когда цели нет: единственные полезные
 * числа без цели — сколько продаж будет при нынешнем темпе и потолок.
 * В деградации чисел нет — честная фраза «прогноз не оценён».
 */
export const AiDailyPlanForecast = ({
    forecast,
    note,
}: AiDailyPlanForecastProps) => (
    <section className="space-y-2 rounded-md border border-border/60 p-3">
        <h4 className="flex items-center gap-2 text-sm font-medium">
            Прогноз месяца
            <ToneBadge tone="muted" variant="soft" size="sm">
                руководителю
            </ToneBadge>
        </h4>
        {forecast ? (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-[auto_1fr]">
                <AiDailyPlanForecastRows forecast={forecast} />
            </dl>
        ) : (
            note && <p className="text-xs text-muted-foreground">{note}</p>
        )}
    </section>
);
