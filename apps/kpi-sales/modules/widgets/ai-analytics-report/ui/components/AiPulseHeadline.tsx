'use client';

import type { ReactNode } from 'react';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_PULSE_TEXT,
    AI_XMR_STATE,
    AiMetricValue,
    aiXmrHintLines,
    formatAiDay,
    type AiHint,
    type AiPulse,
} from '@/modules/entities/ai-analytics';

interface AiPulseHeadlineProps {
    pulse: AiPulse;
    /** Порог длительности: из ответа пульса, иначе из настроек; null — не известен. */
    minDurationSec: number | null;
}

const T = AI_PULSE_TEXT;
const HINT_TRIGGER = 'cursor-help border-b border-dashed border-muted-foreground/60';

/** Подпись строки списка с подсказкой «что это». */
const Term = ({ label, hint }: { label: string; hint: AiHint }) => (
    <dt>
        <HintTooltip title={hint.title} lines={[...hint.lines]}>
            <span className={HINT_TRIGGER}>{label}</span>
        </HintTooltip>
    </dt>
);

const Value = ({ children }: { children: ReactNode }) => (
    <dd className="col-span-2 text-foreground">{children}</dd>
);

/**
 * Шапка пульса: доля звонков с «следующим шагом и датой» за окно
 * (по скольким звонкам, разброс), стабильность доли по дням, окно рабочих
 * дней, разобрано звонков, доля коротких звонков вне разбора — у каждой
 * строки подсказка; порог длительности — из ответа, не литерал.
 */
export const AiPulseHeadline = ({
    pulse,
    minDurationSec,
}: AiPulseHeadlineProps) => {
    const xmr = pulse.xmr ? AI_XMR_STATE[pulse.xmr.state] : null;

    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
                <HintTooltip
                    title={T.headline.hint.title}
                    lines={[...T.headline.hint.lines]}
                >
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        <span className={HINT_TRIGGER}>{T.headline.label}</span>
                    </p>
                </HintTooltip>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                    <AiMetricValue
                        metric={pulse.nextStepDateRate}
                        size="lg"
                        withDetails
                    />
                    {xmr && pulse.xmr && (
                        <HintTooltip
                            title="Стабильность доли по дням"
                            lines={aiXmrHintLines(pulse.xmr)}
                        >
                            <span>
                                <ToneBadge tone={xmr.tone} variant="soft">
                                    Стабильность: {xmr.label}
                                </ToneBadge>
                            </span>
                        </HintTooltip>
                    )}
                </div>
            </div>

            <dl className="grid grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <Term label={T.window.label} hint={T.window.hint} />
                <Value>
                    {formatAiDay(pulse.window.from)} –{' '}
                    {formatAiDay(pulse.window.to)}
                    {' · '}
                    {pulse.window.workdays.length} раб. дн.
                </Value>
                <Term
                    label={T.analyzed.label}
                    hint={T.analyzed.hint(minDurationSec)}
                />
                <Value>{pulse.analyzedCalls.toLocaleString('ru-RU')} звонков</Value>
                <Term label={T.short.label} hint={T.short.hint(minDurationSec)} />
                <Value>{T.short.text(pulse.shortCallsSharePct, minDurationSec)}</Value>
            </dl>
        </div>
    );
};
