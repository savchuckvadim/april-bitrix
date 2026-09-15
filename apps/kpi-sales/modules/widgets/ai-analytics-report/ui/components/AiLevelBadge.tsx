'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_LEVEL,
    aiLevelHintLines,
    type AiFunnelShape,
    type AiManagerLevel,
    type AiManagerLevelSource,
} from '@/modules/entities/ai-analytics';

interface AiLevelBadgeProps {
    level: AiManagerLevel;
    source: AiManagerLevelSource;
    tenureMonths: number | null;
    funnelShape?: AiFunnelShape;
}

/** Бэйдж уровня менеджера (manual — заливка, default — контур) с подсказкой. */
export const AiLevelBadge = ({
    level,
    source,
    tenureMonths,
    funnelShape,
}: AiLevelBadgeProps) => (
    <HintTooltip
        title="Уровень"
        lines={aiLevelHintLines(source, tenureMonths, funnelShape)}
    >
        <span>
            <ToneBadge
                tone={AI_LEVEL[level].tone}
                variant={source === 'manual' ? 'solid' : 'outline'}
                size="sm"
            >
                {AI_LEVEL[level].label}
            </ToneBadge>
        </span>
    </HintTooltip>
);
