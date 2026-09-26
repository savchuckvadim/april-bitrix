'use client';

import { ExternalLink } from 'lucide-react';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import type {
    AiRopMarkCall,
    AiRopMarkInput,
    AiRopMarkWeekQuery,
} from '@/modules/entities/ai-analytics';
import { useAiRopMarkForm } from '../../hooks/use-ai-rop-mark-form';
import { AI_ROP_MARK_REASON } from '../../lib/ai-rop-mark.util';
import { AiManagerName } from './AiManagerName';
import { AiRopMarkForm } from './AiRopMarkForm';
import { AiRopMarkSaved } from './AiRopMarkSaved';

interface AiRopMarkCallItemProps {
    call: AiRopMarkCall;
    index: number;
    query: AiRopMarkWeekQuery | null;
    /** Метка по этому звонку сейчас отправляется. */
    pending: boolean;
    /** Текст 400/403 сервера по последней попытке именно этого звонка. */
    error: string | null;
    /** Заметки последнего сохранения этого звонка. */
    notes: string[];
    onSave: (input: AiRopMarkInput) => Promise<boolean>;
}

/**
 * Звонок подбора: причина подбора (бэйдж с пояснением), менеджер, ссылка
 * «Открыть разбор» на карточку разбора в смарт-процессе портала (link
 * null — элемента ещё нет, показываем id); без метки — форма, с меткой —
 * сохранённое и раскрытая оценка AI.
 */
export const AiRopMarkCallItem = ({
    call,
    index,
    query,
    pending,
    error,
    notes,
    onSave,
}: AiRopMarkCallItemProps) => {
    const form = useAiRopMarkForm({ call, query, onSave });
    const reason = AI_ROP_MARK_REASON[call.reason];

    return (
        <li className="space-y-2 rounded-md border border-border/60 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">
                    {index + 1}.
                </span>
                <HintTooltip title={call.reasonTitle} lines={[reason.hint]}>
                    <span>
                        <ToneBadge tone={reason.tone} variant="soft" size="sm">
                            {call.reasonTitle}
                        </ToneBadge>
                    </span>
                </HintTooltip>
                <AiManagerName managerId={call.managerId} />
                {call.link ? (
                    <a
                        href={call.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        title={`Разбор ${call.transcriptionId}`}
                    >
                        <ExternalLink className="h-3 w-3" />
                        Открыть разбор
                    </a>
                ) : (
                    <span
                        className="text-muted-foreground"
                        title="Элемент разбора ещё не создан"
                    >
                        разбор {call.transcriptionId}
                    </span>
                )}
                {call.marked && (
                    <ToneBadge tone="success" variant="soft" size="sm">
                        оценено
                    </ToneBadge>
                )}
            </div>
            {form.editing ? (
                <AiRopMarkForm
                    form={form.form}
                    error={form.error ?? error}
                    pending={pending}
                    onAgree={form.setAgree}
                    onScore={form.setScore}
                    onToggleSection={form.toggleSection}
                    onWhy={form.setWhy}
                    onHowTo={form.setHowTo}
                    onSubmit={() => void form.submit()}
                    onCancel={form.canCancel ? form.cancelEdit : undefined}
                />
            ) : call.mark ? (
                <AiRopMarkSaved
                    call={call}
                    mark={call.mark}
                    notes={notes}
                    onEdit={form.startEdit}
                />
            ) : (
                <p className="text-xs text-muted-foreground">
                    Метка сохранена — обновляем подбор…
                </p>
            )}
        </li>
    );
};
