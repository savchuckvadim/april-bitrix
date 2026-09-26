'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    aiYoyBadgeLabel,
    aiYoyHintLines,
    aiYoyTone,
    type AiYoy,
} from '@/modules/entities/ai-analytics';

interface AiYoyBadgeProps {
    yoy: AiYoy | null | undefined;
}

/**
 * Бэйдж «год назад» строки: разница оценки с тем же месяцем годом ранее и
 * подсказка со всеми величинами и оговорками сопоставимости. Пары нет
 * (период не месяц, истории год назад нет) — прочерк.
 */
export const AiYoyBadge = ({ yoy }: AiYoyBadgeProps) => {
    if (!yoy) return <span className="text-muted-foreground">—</span>;
    return (
        <HintTooltip title="Тот же месяц год назад" lines={aiYoyHintLines(yoy)}>
            <span>
                <ToneBadge tone={aiYoyTone(yoy)} variant="soft" size="sm">
                    {aiYoyBadgeLabel(yoy)}
                </ToneBadge>
            </span>
        </HintTooltip>
    );
};
