'use client';

import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_FEEDBACK_OBJECT,
    AI_SIGNAL,
    aiAttentionActionLine,
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
 * Карточка «Внимание»: ранг, сигнал (ToneBadge с подсказкой: что значит,
 * что сделать, основание из basis), менеджер, заголовок с числами, строка
 * «Что сделать», переход к менеджеру/типу, «полезно / не полезно».
 */
export const AiAttentionCard = ({ item, onOpenType }: AiAttentionCardProps) => {
    const signal = AI_SIGNAL[item.signal];
    const callTypeBadge = useAiCallTypeBadge();
    const linkType = item.link.callType;
    const callType = linkType ? callTypeBadge(linkType) : null;
    const riskCount = item.link.transcriptionIds?.length ?? 0;
    // Ссылки на карточки разборов риск-звонков (бэк подставляет по
    // transcriptionIds; null — элемента разбора в смарте ещё нет).
    const callLinks = (item.link.calls ?? []).filter(
        (call): call is { transcriptionId: string; link: string } =>
            call.link !== null,
    );

    return (
        <li className="flex flex-col gap-2 rounded-md border border-border/60 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">
                    {item.rank}.
                </span>
                <HintTooltip
                    title={signal.label}
                    lines={aiAttentionHintLines(item)}
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
            <p className="text-xs text-muted-foreground">
                {aiAttentionActionLine(item.signal)}
            </p>
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
                    {callLinks.map((call, index) => (
                        <a
                            key={call.transcriptionId}
                            href={call.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
                            title="Открыть разбор звонка"
                        >
                            {callLinks.length > 1
                                ? `разбор ${index + 1}`
                                : 'открыть разбор'}
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    ))}
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
