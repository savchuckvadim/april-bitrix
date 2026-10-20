'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import type { AiBrief } from '@/modules/entities/ai-analytics';
import { AI_BRIEF_TONE, AI_BRIEF_TONE_HINT } from '../../lib/ai-brief.util';

interface AiBriefHeadlineProps {
    brief: Pick<AiBrief, 'headline' | 'tone'>;
}

/** Главный вывод периода одной фразой и бэйдж тона с подсказкой «что значит». */
export const AiBriefHeadline = ({ brief }: AiBriefHeadlineProps) => {
    const tone = AI_BRIEF_TONE[brief.tone];

    return (
        <div className="space-y-1">
            <HintTooltip title={AI_BRIEF_TONE_HINT.title} lines={[...AI_BRIEF_TONE_HINT.lines]}>
                <span>
                    <ToneBadge tone={tone.tone} variant="soft" size="sm">
                        {tone.label}
                    </ToneBadge>
                </span>
            </HintTooltip>
            <h3 className="text-base font-medium leading-snug">
                {brief.headline}
            </h3>
        </div>
    );
};
