'use client';

import { HintTooltip } from '@workspace/april-ui';
import { formatAiMoment, type AiBrief } from '@/modules/entities/ai-analytics';
import { aiBriefCostHint, aiBriefFooterReason } from '../../lib/ai-brief.util';

interface AiBriefMetaProps {
    brief: Pick<AiBrief, 'generatedAt' | 'source' | 'reason' | 'usage'>;
}

/**
 * Строка под итогами: когда собрано (стоимость подготовки — в подсказке)
 * и, если итоги собраны по шаблону, причина.
 */
export const AiBriefMeta = ({ brief }: AiBriefMetaProps) => {
    const costHint = aiBriefCostHint(brief.usage);
    const reason = aiBriefFooterReason(brief);
    const built = `собрано ${formatAiMoment(brief.generatedAt)}`;

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {costHint ? (
                <HintTooltip lines={[costHint]}>
                    <span className="cursor-help underline decoration-dotted underline-offset-2">
                        {built}
                    </span>
                </HintTooltip>
            ) : (
                <span>{built}</span>
            )}
            {reason && <span>{reason}</span>}
        </div>
    );
};
