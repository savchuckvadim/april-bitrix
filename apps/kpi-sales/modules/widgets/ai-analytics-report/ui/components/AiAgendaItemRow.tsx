'use client';

import { ExternalLink } from 'lucide-react';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_FEEDBACK_OBJECT,
    AI_SCORE_SCALE_HINT,
    aiAgendaKindView,
    formatAiScore,
    type AiAgendaItem,
} from '@/modules/entities/ai-analytics';
import { useAiCallTypeBadge } from '../../hooks/use-ai-call-type-badge';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';
import { AiFeedbackButtons } from './AiFeedbackButtons';
import { AiManagerName } from './AiManagerName';

interface AiAgendaItemRowProps {
    item: AiAgendaItem;
    index: number;
}

/**
 * Звонок повестки: причина (бэйдж с подсказкой «что это и что сделать»),
 * менеджер, тип, цитата, ссылка на разбор. Причина из старого кэша,
 * которой нет в словаре, получает запасную подпись.
 */
export const AiAgendaItemRow = ({ item, index }: AiAgendaItemRowProps) => {
    const managerName = useAiManagerName();
    const callTypeBadge = useAiCallTypeBadge();
    const kind = aiAgendaKindView(item.kind);
    const callType = item.callType ? callTypeBadge(item.callType) : null;

    return (
        <li className="rounded-md border border-border/60 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">
                    {index + 1}.
                </span>
                <HintTooltip title={kind.label} lines={[kind.hint]}>
                    <span>
                        <ToneBadge tone={kind.tone} variant="soft" size="sm">
                            {kind.label}
                        </ToneBadge>
                    </span>
                </HintTooltip>
                {item.managerId ? (
                    <AiManagerName managerId={item.managerId} tab="calls" />
                ) : (
                    <span className="font-medium text-foreground">
                        {managerName(item.managerId)}
                    </span>
                )}
                {callType && (
                    <ToneBadge tone={callType.tone} variant="outline" size="sm">
                        {callType.label}
                    </ToneBadge>
                )}
                {item.score !== null && (
                    <HintTooltip title="Оценка звонка" lines={[AI_SCORE_SCALE_HINT]}>
                        <span className="cursor-help border-b border-dashed text-muted-foreground">
                            оценка {formatAiScore(item.score)}
                        </span>
                    </HintTooltip>
                )}
            </div>
            <p className="mt-2 text-sm">{item.reason}</p>
            {item.quote && (
                <blockquote className="mt-2 border-l-2 border-muted-foreground/40 pl-3 text-sm italic text-muted-foreground">
                    «{item.quote}»
                </blockquote>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                {item.link ? (
                    <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                        <ExternalLink className="h-3 w-3" />
                        Открыть разбор
                    </a>
                ) : (
                    <span />
                )}
                <AiFeedbackButtons
                    object={AI_FEEDBACK_OBJECT.call(item.transcriptionId)}
                    managerId={item.managerId}
                    transcriptionId={item.transcriptionId}
                />
            </div>
        </li>
    );
};
