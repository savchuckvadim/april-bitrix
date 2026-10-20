'use client';

import { formatAiMoment, type AiBrief } from '@/modules/entities/ai-analytics';
import { aiBriefFooterReason } from '../../lib/ai-brief.util';

interface AiBriefMetaProps {
    brief: Pick<AiBrief, 'generatedAt' | 'source' | 'reason'>;
}

/**
 * Строка под итогами: когда собрано и, если итоги собраны по шаблону,
 * причина. Стоимость подготовки руководителю не показываем (решение
 * владельца 30.09.2026): это служебное число, не повод для действий.
 */
export const AiBriefMeta = ({ brief }: AiBriefMetaProps) => {
    const reason = aiBriefFooterReason(brief);
    const built = `собрано ${formatAiMoment(brief.generatedAt)}`;

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{built}</span>
            {reason && <span>{reason}</span>}
        </div>
    );
};
