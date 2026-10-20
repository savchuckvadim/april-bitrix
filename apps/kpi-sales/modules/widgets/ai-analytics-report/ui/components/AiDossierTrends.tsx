'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_TREND_GOODHART,
    AI_TREND_KIND,
    aiDossierMetricLabel,
    aiTrendDirectionWord,
    formatAiGoodhartFlag,
    formatAiTrendMagnitude,
    formatAiWeekKey,
    type AiManagerTrends,
} from '@/modules/entities/ai-analytics';
import { aiStyleConfidence } from '../../lib/ai-style.util';

interface AiDossierTrendsProps {
    trends: AiManagerTrends;
}

/**
 * Тренды менеджера в досье: сигналы (показатель, вид, направление словами,
 * величина, с какой недели) и флаги «показатель растёт, результат нет» с
 * подсказкой; шапка — неделя расчёта, разборов в окне, сравнимых недель и
 * насколько уверены.
 */
export const AiDossierTrends = ({ trends }: AiDossierTrendsProps) => (
    <div className="space-y-2 text-sm">
        <p className="text-xs text-muted-foreground">
            Неделя расчёта {formatAiWeekKey(trends.weekKey)} · разборов в окне{' '}
            {trends.calls} · сравнимых недель {trends.weeks} · насколько уверены:{' '}
            {aiStyleConfidence(trends.confidence).label}
        </p>
        {trends.signals.length ? (
            <ul className="space-y-1">
                {trends.signals.map(signal => (
                    <li
                        key={`${signal.metric}-${signal.kind}-${signal.sinceWeek}`}
                        className="flex flex-wrap items-center gap-2"
                    >
                        <ToneBadge
                            tone={AI_TREND_KIND[signal.kind].tone}
                            variant="soft"
                            size="sm"
                        >
                            {AI_TREND_KIND[signal.kind].label}
                        </ToneBadge>
                        <span>
                            {aiDossierMetricLabel(signal.metric)}{' '}
                            {aiTrendDirectionWord(signal.direction)}:{' '}
                            {formatAiTrendMagnitude(signal)} с недели{' '}
                            {formatAiWeekKey(signal.sinceWeek)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            насколько уверены:{' '}
                            {aiStyleConfidence(signal.confidence).label}
                        </span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-xs text-muted-foreground">
                Ряды спокойны: сдвигов и дрейфов за окно нет.
            </p>
        )}
        {trends.goodhart && trends.goodhart.length > 0 && (
            <ul className="space-y-1">
                {trends.goodhart.map(flag => (
                    <li
                        key={flag.pair}
                        className="flex flex-wrap items-center gap-2"
                    >
                        <HintTooltip
                            title={AI_TREND_GOODHART.hint.title}
                            lines={[...AI_TREND_GOODHART.hint.lines]}
                        >
                            <span>
                                <ToneBadge tone="warning" variant="soft" size="sm">
                                    {AI_TREND_GOODHART.label}
                                </ToneBadge>
                            </span>
                        </HintTooltip>
                        <span>{formatAiGoodhartFlag(flag)}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);
