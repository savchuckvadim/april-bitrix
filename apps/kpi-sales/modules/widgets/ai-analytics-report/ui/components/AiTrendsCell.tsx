'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    aiTrendsHintLines,
    aiTrendsSummaryLabel,
    aiTrendsTone,
    type AiManagerTrends,
} from '@/modules/entities/ai-analytics';

interface AiTrendsCellProps {
    trends: AiManagerTrends | null | undefined;
}

/**
 * Ячейка «Тренды» строки: бэйдж со сводкой словами («снижается: 2 ·
 * растёт: 1 · показатель растёт, результат нет»; тон — по худшему сигналу
 * вниз) и подсказкой с каждым сигналом и флагом. Блока нет (тренды ещё не
 * посчитаны или разборов мало) — прочерк.
 */
export const AiTrendsCell = ({ trends }: AiTrendsCellProps) => {
    if (!trends) return <span className="text-muted-foreground">—</span>;
    return (
        <HintTooltip title="Тренды" lines={aiTrendsHintLines(trends)}>
            <span>
                <ToneBadge tone={aiTrendsTone(trends)} variant="soft" size="sm">
                    {aiTrendsSummaryLabel(trends)}
                </ToneBadge>
            </span>
        </HintTooltip>
    );
};
