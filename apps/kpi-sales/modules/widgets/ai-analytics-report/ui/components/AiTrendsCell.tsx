'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    aiTrendsHintLines,
    aiTrendsTone,
    type AiManagerTrends,
} from '@/modules/entities/ai-analytics';

interface AiTrendsCellProps {
    trends: AiManagerTrends | null | undefined;
}

/** Короткая подпись ячейки: сколько сигналов вниз/вверх, есть ли флаги «показатель ↑ результат ↓». */
export const aiTrendsCellLabel = (trends: AiManagerTrends): string => {
    const down = trends.signals.filter(s => s.direction === 'down').length;
    const up = trends.signals.length - down;
    const parts: string[] = [];
    if (down) parts.push(`↓ ${down}`);
    if (up) parts.push(`↑ ${up}`);
    if (trends.goodhart?.length) parts.push('метрика ↑ результат ↓');
    return parts.length ? parts.join(' · ') : 'ровно';
};

/**
 * Ячейка «Тренды» строки: бэйдж со сводкой сигналов (тон — по худшему
 * сигналу вниз) и подсказкой с каждым сигналом и флагом. Блока нет
 * (тренды ещё не посчитаны или разборов мало) — прочерк.
 */
export const AiTrendsCell = ({ trends }: AiTrendsCellProps) => {
    if (!trends) return <span className="text-muted-foreground">—</span>;
    return (
        <HintTooltip title="Тренды" lines={aiTrendsHintLines(trends)}>
            <span>
                <ToneBadge tone={aiTrendsTone(trends)} variant="soft" size="sm">
                    {aiTrendsCellLabel(trends)}
                </ToneBadge>
            </span>
        </HintTooltip>
    );
};
