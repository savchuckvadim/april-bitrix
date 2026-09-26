'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import type { AiStyleTag } from '@/modules/entities/ai-analytics';
import {
    AI_STYLE_DISPUTED_TEXT,
    aiStyleTagHintLines,
} from '../../lib/ai-style.util';

interface AiStyleTagChipProps {
    tag: AiStyleTag;
}

/**
 * Подпись стиля чипом с подсказкой (опора в числах, n); оспоренная
 * сотрудником — контуром с пометкой «оспорена менеджером».
 */
export const AiStyleTagChip = ({ tag }: AiStyleTagChipProps) => (
    <HintTooltip title={tag.title} lines={aiStyleTagHintLines(tag)}>
        <span>
            <ToneBadge
                tone={tag.disputed ? 'muted' : 'accent'}
                variant={tag.disputed ? 'outline' : 'soft'}
                size="sm"
            >
                {tag.title}
                {tag.disputed && (
                    <span className="font-normal opacity-80">
                        · {AI_STYLE_DISPUTED_TEXT}
                    </span>
                )}
            </ToneBadge>
        </span>
    </HintTooltip>
);
