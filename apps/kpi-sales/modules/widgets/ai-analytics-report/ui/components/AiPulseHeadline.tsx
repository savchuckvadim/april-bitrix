'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_XMR_STATE,
    AiMetricValue,
    aiXmrHintLines,
    formatAiDay,
    type AiPulse,
} from '@/modules/entities/ai-analytics';

interface AiPulseHeadlineProps {
    pulse: AiPulse;
}

/**
 * Шапка пульса: доля звонков с «следующим шагом и датой» за окно
 * (n, интервал), состояние XmR, окно рабочих дней, разобрано звонков,
 * доля коротких звонков вне разбора.
 */
export const AiPulseHeadline = ({ pulse }: AiPulseHeadlineProps) => {
    const xmr = pulse.xmr ? AI_XMR_STATE[pulse.xmr.state] : null;

    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Следующий шаг с датой
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                    <AiMetricValue
                        metric={pulse.nextStepDateRate}
                        size="lg"
                        withDetails
                    />
                    {xmr && pulse.xmr && (
                        <HintTooltip
                            title="Контрольная карта XmR"
                            lines={aiXmrHintLines(pulse.xmr)}
                        >
                            <span>
                                <ToneBadge tone={xmr.tone} variant="soft">
                                    XmR: {xmr.label}
                                </ToneBadge>
                            </span>
                        </HintTooltip>
                    )}
                </div>
            </div>

            <dl className="grid grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <dt>Окно</dt>
                <dd className="col-span-2 text-foreground">
                    {formatAiDay(pulse.window.from)} –{' '}
                    {formatAiDay(pulse.window.to)}
                    {' · '}
                    {pulse.window.workdays.length} раб. дн.
                </dd>
                <dt>Разобрано</dt>
                <dd className="col-span-2 text-foreground">
                    {pulse.analyzedCalls.toLocaleString('ru-RU')} звонков
                </dd>
                <dt>Короткие</dt>
                <dd className="col-span-2 text-foreground">
                    {Math.round(pulse.shortCallsSharePct)} % звонков короче 5
                    минут — вне разбора
                </dd>
            </dl>
        </div>
    );
};
