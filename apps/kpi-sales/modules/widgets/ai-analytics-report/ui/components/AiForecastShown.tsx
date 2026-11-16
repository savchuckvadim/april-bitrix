'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { AI_FORECAST_TEXT } from '../../lib/ai-forecast.texts';
import type { AiForecastShownView } from '../../lib/ai-forecast-shown.util';

const T = AI_FORECAST_TEXT.published;
const DASHED = 'border-b border-dashed border-muted-foreground';

/**
 * Число прогноза с пометкой — пока вилка не опубликована: чей это расчёт
 * (модель, по темпу, среднее за три месяца), почему показан он и сколько
 * уже сделано. Видно всем руководителям; техника проверки — отдельным
 * блоком только суперпользователю вендора.
 */
export const AiForecastShown = ({ view }: { view: AiForecastShownView }) => (
    <div className="space-y-2">
        <p className="text-xs text-muted-foreground">{view.period}</p>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <div className="flex flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <HintTooltip title={view.title} lines={[view.hint]}>
                        <span className={DASHED}>{view.title}</span>
                    </HintTooltip>
                    <ToneBadge tone={view.badgeTone} variant="soft" size="sm">
                        {view.badge}
                    </ToneBadge>
                </span>
                <span className="text-2xl font-semibold tabular-nums">
                    {view.value}
                </span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{T.done}</span>
                <span className="text-lg font-medium tabular-nums text-muted-foreground">
                    {view.done ?? T.doneMissing}
                </span>
            </div>
        </div>
        <p className="text-xs text-muted-foreground">{view.note}</p>
    </div>
);
