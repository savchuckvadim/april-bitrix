'use client';

import { RotateCw, Shuffle } from 'lucide-react';
import { SectionCard, ToneBadge } from '@workspace/april-ui';
import { useAiRopMark } from '../hooks/use-ai-rop-mark';
import {
    AI_ROP_MARK_EMPTY_TEXT,
    aiRopMarkProgress,
    aiRopMarkSaveNotes,
    formatAiRopMarkPeriod,
    formatAiRopMarkProgress,
} from '../lib/ai-rop-mark.util';
import { AI_ROP_MARK_NO_CALLS_TEXT } from '../lib/ai-rop-mark-state.util';
import { AiSectionState } from './components/AiSectionState';
import { AiRopMarkCallItem } from './components/AiRopMarkCallItem';
import { AiRopMarkNotice } from './components/AiRopMarkNotice';

/**
 * Слепая оценка руководителя «три звонка недели» (rop-mark): подбор
 * недели без оценки AI, форма метки по каждому звонку; после сохранения
 * тип и оценка разбора раскрываются. Только руководителям (cup/op/group)
 * — остальным карточка не рендерится (сервер ответил бы 403). Подбора
 * нет — «Подобрать» (list с force → pick); подбор без звонков —
 * «Подобрать заново» (pick с forceRefresh). Ошибка — текст сервера как
 * есть, «Повторить» — только когда повтор может помочь. Суперпользователю
 * вендора — строка «только чтение», без формы метки и «Подобрать заново».
 */
export const AiRopMarkCard = () => {
    const ropMark = useAiRopMark();
    if (!ropMark.isLeader) return null;

    const { week, view, errorView } = ropMark;
    const loading = ropMark.status === 'loading';
    const progress = view === 'calls' && week ? aiRopMarkProgress(week) : null;
    const repickLabel = loading ? 'Подбираем…' : 'Подобрать заново';

    return (
        <SectionCard
            surface="glass"
            title="Слепая оценка: три звонка недели"
            description={
                week
                    ? `Неделя ${formatAiRopMarkPeriod(week)}`
                    : 'Проверка разбора руководителем: до трёх звонков недели без подсказки AI'
            }
            actions={
                progress && (
                    <ToneBadge
                        tone={
                            progress.marked === progress.total
                                ? 'success'
                                : 'muted'
                        }
                        variant="soft"
                        size="sm"
                    >
                        {formatAiRopMarkProgress(progress)}
                    </ToneBadge>
                )
            }
        >
            {ropMark.superUserHint && (
                <p className="mb-2 text-xs text-muted-foreground">
                    {ropMark.superUserHint}
                </p>
            )}
            {view === 'loading' && (
                <AiSectionState
                    status={ropMark.status}
                    error={null}
                    loadingText="Подбираем звонки недели…"
                />
            )}
            {view === 'error' && (
                <AiRopMarkNotice
                    error
                    text={errorView.text}
                    actionLabel={errorView.canRetry ? 'Повторить' : undefined}
                    actionIcon={<RotateCw className="h-3 w-3" />}
                    onAction={ropMark.retry}
                />
            )}
            {view === 'noPick' && (
                <AiRopMarkNotice
                    text={AI_ROP_MARK_EMPTY_TEXT}
                    actionLabel="Подобрать"
                    actionIcon={<Shuffle className="h-3 w-3" />}
                    onAction={ropMark.pick}
                    actionDisabled={loading}
                    actionHint={ropMark.readOnlyHint}
                />
            )}
            {view === 'noCalls' && (
                <AiRopMarkNotice
                    text={AI_ROP_MARK_NO_CALLS_TEXT}
                    actionLabel={
                        ropMark.showWriteControls ? repickLabel : undefined
                    }
                    actionIcon={<Shuffle className="h-3 w-3" />}
                    onAction={ropMark.repick}
                    actionDisabled={loading}
                    actionHint={ropMark.readOnlyHint}
                />
            )}
            {view === 'calls' && week && (
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                        {week.blindNote}
                    </p>
                    <ol className="space-y-2">
                        {week.calls.map((call, index) => {
                            const isLast =
                                ropMark.lastCallId === call.transcriptionId;
                            return (
                                <AiRopMarkCallItem
                                    key={call.transcriptionId}
                                    call={call}
                                    index={index}
                                    query={ropMark.query}
                                    pending={
                                        ropMark.savePending ===
                                        call.transcriptionId
                                    }
                                    error={isLast ? ropMark.saveError : null}
                                    notes={
                                        isLast
                                            ? aiRopMarkSaveNotes(
                                                  ropMark.lastSaved,
                                              )
                                            : []
                                    }
                                    readOnlyHint={ropMark.readOnlyHint}
                                    canMark={ropMark.showWriteControls}
                                    onSave={ropMark.save}
                                />
                            );
                        })}
                    </ol>
                </div>
            )}
        </SectionCard>
    );
};
