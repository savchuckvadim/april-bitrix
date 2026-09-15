'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_FEEDBACK_OBJECT,
    AI_SIGNAL,
    aiAttentionHintLines,
    type AiAttentionItem,
} from '@/modules/entities/ai-analytics';
import { useAiCallTypeBadge } from '../../hooks/use-ai-call-type-badge';
import { AiManagerName } from './AiManagerName';
import { AiFeedbackButtons } from './AiFeedbackButtons';

interface AiAttentionCardProps {
    item: AiAttentionItem;
    /** Открыть разбор по типу звонка из ссылки карточки. */
    onOpenType: (callType: string) => void;
}

/**
 * Карточка «Внимание»: ранг, сигнал (ToneBadge с подсказкой «Основание»
 * из basis), менеджер, заголовок с числами, переход к менеджеру/типу,
 * «полезно / не полезно».
 */
export const AiAttentionCard = ({ item, onOpenType }: AiAttentionCardProps) => {
    const signal = AI_SIGNAL[item.signal];
    const callTypeBadge = useAiCallTypeBadge();
    const linkType = item.link.callType;
    const callType = linkType ? callTypeBadge(linkType) : null;
    const riskCount = item.link.transcriptionIds?.length ?? 0;

    return (
        <li className="flex flex-col gap-2 rounded-md border border-border/60 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">
                    {item.rank}.
                </span>
                <HintTooltip
                    title="Основание"
                    lines={[signal.hint, ...aiAttentionHintLines(item)]}
                >
                    <span>
                        <ToneBadge tone={signal.tone} variant="soft" size="sm">
                            {signal.label}
                        </ToneBadge>
                    </span>
                </HintTooltip>
                <AiManagerName managerId={item.managerId} />
                {callType && (
                    <ToneBadge tone={callType.tone} variant="outline" size="sm">
                        {callType.label}
                    </ToneBadge>
                )}
            </div>
            <p className="text-sm">{item.headline}</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {linkType && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs"
                            onClick={() => onOpenType(linkType)}
                        >
                            Разбор по типу
                            <ArrowRight className="h-3 w-3" />
                        </Button>
                    )}
                    {riskCount > 0 && <span>риск-звонков: {riskCount}</span>}
                </div>
                <AiFeedbackButtons
                    object={AI_FEEDBACK_OBJECT.attention(
                        item.managerId,
                        item.signal,
                    )}
                    managerId={item.managerId}
                />
            </div>
        </li>
    );
};
