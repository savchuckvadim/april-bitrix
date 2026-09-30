'use client';

import { LiquidProgress, ToneBadge } from '@workspace/april-ui';
import { AI_FORECAST_TEXT } from '../../lib/ai-forecast.texts';
import type { AiForecastShadowView } from '../../lib/ai-forecast.util';
import { AiForecastTodo } from './AiForecastTodo';

const T = AI_FORECAST_TEXT;

interface AiForecastShadowProps {
    view: AiForecastShadowView;
}

/**
 * Прогноз «в тени»: вилку не показываем — только сколько месяцев
 * сверки с фактом набралось, когда примерно откроется, как прогноз
 * выдержал последнюю проверку на истории и что делать.
 */
export const AiForecastShadow = ({ view }: AiForecastShadowProps) => (
    <div className="space-y-3">
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                    {view.progressTitle}
                </span>
                <ToneBadge
                    tone={view.stageReady ? 'success' : 'info'}
                    variant="soft"
                    size="sm"
                >
                    {view.stageReady ? T.shadow.stageReady : T.shadow.badge}
                </ToneBadge>
            </div>
            <div className="flex max-w-sm items-center gap-2">
                <LiquidProgress
                    size="sm"
                    tone={view.stageReady ? 'success' : 'warning'}
                    value={view.share}
                />
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {view.progress.value} / {view.progress.target}
                </span>
            </div>
            {view.eta && (
                <p className="text-xs text-muted-foreground">{view.eta}</p>
            )}
        </div>
        <p className="text-xs text-muted-foreground">{view.explain}</p>
        <p className="text-xs">
            <span className="font-medium">{T.accuracy.label}:</span>{' '}
            <span className="text-muted-foreground">{view.accuracy}</span>
        </p>
        <AiForecastTodo
            text={view.todo}
            links={[
                { topic: view.theory },
                { topic: 'forecastBacktest', label: T.theoryAccuracy },
            ]}
        />
    </div>
);
