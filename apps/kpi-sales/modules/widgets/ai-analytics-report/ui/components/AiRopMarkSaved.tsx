'use client';

import { Pencil } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    formatAiMoment,
    type AiRopMark,
    type AiRopMarkCall,
} from '@/modules/entities/ai-analytics';
import {
    AI_ROP_MARK_REMARK_HINT,
    aiRopMarkSectionLabel,
    formatAiRopMarkAiScore,
} from '../../lib/ai-rop-mark.util';
import { AiCallTypeBadge } from './AiCallTypeBadge';

interface AiRopMarkSavedProps {
    call: AiRopMarkCall;
    mark: AiRopMark;
    /** Заметки последнего сохранения: прежняя метка заменена / метка не слепая. */
    notes: string[];
    /** Нет — «Изменить метку» не показываем (суперпользователь вендора). */
    onEdit?: () => void;
}

/**
 * Сохранённая метка: согласие, оценка руководителя, слепая ли, разделы,
 * тексты; раскрытые после метки тип и оценка разбора AI; заметки о
 * замене; «Изменить метку» (повторная метка уже не слепая).
 */
export const AiRopMarkSaved = ({
    call,
    mark,
    notes,
    onEdit,
}: AiRopMarkSavedProps) => (
    <div className="space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs">
            <ToneBadge
                tone={mark.agree ? 'success' : 'warning'}
                variant="soft"
                size="sm"
            >
                {mark.agree ? 'Согласен с AI' : 'Не согласен с AI'}
            </ToneBadge>
            <span>
                оценка руководителя:{' '}
                <b className="tabular-nums">{mark.ropScore ?? '—'}</b>
            </span>
            <ToneBadge
                tone={mark.blind ? 'info' : 'muted'}
                variant="outline"
                size="sm"
                title={
                    mark.blind
                        ? 'Оценка AI на момент метки не показывалась'
                        : 'Оценка AI к моменту метки уже была раскрыта'
                }
            >
                {mark.blind ? 'слепая' : 'не слепая'}
            </ToneBadge>
            <span className="text-muted-foreground">
                {formatAiMoment(mark.markedAt)}
            </span>
        </div>
        {mark.sections.length > 0 && (
            <div className="flex flex-wrap gap-1">
                {mark.sections.map(code => (
                    <ToneBadge
                        key={code}
                        tone="neutral"
                        variant="outline"
                        size="sm"
                    >
                        {aiRopMarkSectionLabel(code)}
                    </ToneBadge>
                ))}
            </div>
        )}
        {mark.why && (
            <p>
                <span className="text-muted-foreground">Почему так: </span>
                {mark.why}
            </p>
        )}
        {mark.howTo && (
            <p>
                <span className="text-muted-foreground">Как лучше: </span>
                {mark.howTo}
            </p>
        )}
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs">
            <span className="text-muted-foreground">Разбор AI:</span>
            {call.aiCallType ? (
                <AiCallTypeBadge code={call.aiCallType} />
            ) : (
                <span className="text-muted-foreground">тип не определён</span>
            )}
            <span>
                оценка{' '}
                <b className="tabular-nums">
                    {formatAiRopMarkAiScore(call.aiScore)}
                </b>
            </span>
        </div>
        {notes.length > 0 && (
            <ul className="space-y-0.5 text-xs text-muted-foreground">
                {notes.map(note => (
                    <li key={note}>{note}</li>
                ))}
            </ul>
        )}
        {onEdit && (
            <HintTooltip
                title="Изменить метку"
                lines={[AI_ROP_MARK_REMARK_HINT]}
            >
                <span className="inline-flex">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-1 text-xs"
                        onClick={onEdit}
                    >
                        <Pencil className="h-3 w-3" />
                        Изменить метку
                    </Button>
                </span>
            </HintTooltip>
        )}
    </div>
);
