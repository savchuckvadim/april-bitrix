'use client';

import { Target } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { AI_DAILY_PLAN_NO_TARGET } from '../../lib/ai-daily-plan-activity.data';
import type { AiDailyPlanView } from '../../lib/ai-daily-plan-view.util';
import { AiDailyPlanForecast } from './AiDailyPlanForecast';

interface AiDailyPlanNoTargetProps {
    view: AiDailyPlanView;
    /** Открыть настройки на «Цели по уровням»; нет — прав на настройку нет. */
    onOpenTargets?: () => void;
}

/**
 * Цели на месяц нет — план дня не считается (бэк отдал бы «закрыто 2 из 0»).
 * Вместо таблицы: факт месяца, ожидание от сделок в работе, причина
 * упрощённого расчёта, прогноз руководителю (реальные числа не прячем, а
 * неоценённый — честной фразой) и что нужно для плана: источники цели,
 * когда каждый дойдёт до плана дня и план-факта, кнопка «Задать цель» — тому,
 * кто может настраивать, остальным — к кому идти.
 */
export const AiDailyPlanNoTarget = ({
    view,
    onOpenTargets,
}: AiDailyPlanNoTargetProps) => (
    <div className="space-y-3">
        <div className="space-y-1">
            <p className="text-sm font-medium">{view.headline}</p>
            <p className="text-xs text-muted-foreground">{view.monthFacts}</p>
            {view.pipelineFact && (
                <p className="text-xs text-muted-foreground">
                    {view.pipelineFact}
                </p>
            )}
            {view.reasonText && (
                <p className="text-xs text-muted-foreground">
                    {view.reasonText}.
                </p>
            )}
        </div>

        {(view.forecast || view.forecastNote) && (
            <AiDailyPlanForecast
                forecast={view.forecast}
                note={view.forecastNote}
            />
        )}

        <section className="space-y-2 rounded-md border border-dashed border-border/60 p-3 text-xs">
            <h4 className="text-sm font-medium">
                {AI_DAILY_PLAN_NO_TARGET.title}
            </h4>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                {AI_DAILY_PLAN_NO_TARGET.ways.map(way => (
                    <li key={way}>{way}</li>
                ))}
            </ul>
            <div className="space-y-1 text-muted-foreground">
                {AI_DAILY_PLAN_NO_TARGET.timing.map(line => (
                    <p key={line}>{line}</p>
                ))}
            </div>
            {onOpenTargets ? (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={onOpenTargets}
                >
                    <Target className="h-3 w-3" />
                    {AI_DAILY_PLAN_NO_TARGET.action}
                </Button>
            ) : (
                <p className="font-medium">
                    {AI_DAILY_PLAN_NO_TARGET.askLeader}
                </p>
            )}
        </section>
    </div>
);
