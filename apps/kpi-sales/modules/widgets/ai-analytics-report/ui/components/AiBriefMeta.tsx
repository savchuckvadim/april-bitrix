'use client';

import { formatAiMoment, type AiBrief } from '@/modules/entities/ai-analytics';
import { AI_BRIEF_SOURCE, formatAiBriefUsage } from '../../lib/ai-brief.util';

interface AiBriefMetaProps {
    brief: AiBrief;
}

/** Служебная строка: момент сборки, источник, расход модели (токены / ₽), версия промпта. */
export const AiBriefMeta = ({ brief }: AiBriefMetaProps) => {
    const usage = formatAiBriefUsage(brief.usage);

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>собрано {formatAiMoment(brief.generatedAt)}</span>
            <span>источник: {AI_BRIEF_SOURCE[brief.source]}</span>
            {usage && <span>расход: {usage}</span>}
            <span>промпт {brief.promptVersion}</span>
        </div>
    );
};
