'use client';

import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import type { AiBrief } from '@/modules/entities/ai-analytics';
import {
    AI_BRIEF_TONE,
    aiBriefTemplateReason,
    isAiBriefTemplate,
} from '../../lib/ai-brief.util';

interface AiBriefHeadlineProps {
    brief: AiBrief;
}

/** Заголовок резюме и бэйдж тона; шаблон — бэйдж «шаблон» и подпись причины. */
export const AiBriefHeadline = ({ brief }: AiBriefHeadlineProps) => {
    const tone = AI_BRIEF_TONE[brief.tone];
    const template = isAiBriefTemplate(brief.source);
    const reason = aiBriefTemplateReason(brief.reason);

    return (
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <ToneBadge tone={tone.tone} variant="soft" size="sm">
                    {tone.label}
                </ToneBadge>
                {template && (
                    <HintTooltip title="Почему шаблон" lines={[reason]}>
                        <span>
                            <ToneBadge tone="muted" variant="outline" size="sm">
                                шаблон
                            </ToneBadge>
                        </span>
                    </HintTooltip>
                )}
            </div>
            <h3 className="text-base font-medium leading-snug">
                {brief.headline}
            </h3>
            {template && (
                <p className="text-xs text-muted-foreground">
                    Шаблон: {reason}
                </p>
            )}
        </div>
    );
};
