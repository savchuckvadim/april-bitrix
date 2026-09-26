'use client';

import { Shuffle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { SectionCard, ToneBadge } from '@workspace/april-ui';
import { useAiRopMark } from '../hooks/use-ai-rop-mark';
import {
    AI_ROP_MARK_EMPTY_TEXT,
    aiRopMarkProgress,
    aiRopMarkSaveNotes,
    formatAiRopMarkPeriod,
    formatAiRopMarkProgress,
} from '../lib/ai-rop-mark.util';
import { AiSectionState } from './components/AiSectionState';
import { AiRopMarkCallItem } from './components/AiRopMarkCallItem';

/**
 * Слепая оценка руководителя «три звонка недели» (rop-mark): подбор
 * недели без оценки AI, форма метки по каждому звонку; после сохранения
 * тип и оценка разбора раскрываются. Только руководителям (cup/op/group)
 * — остальным карточка не рендерится (сервер ответил бы 403). Подбора
 * нет — «Подобрать» (list с force → pick).
 */
export const AiRopMarkCard = () => {
    const ropMark = useAiRopMark();
    if (!ropMark.isLeader) return null;

    const { week } = ropMark;
    const showState = !week || ropMark.status === 'error';
    const showWeek = !!week && ropMark.status !== 'error';
    const progress =
        showWeek && !ropMark.isEmpty ? aiRopMarkProgress(week) : null;

    return (
        <SectionCard
            surface="glass"
            title="Слепая оценка: три звонка недели"
            description={
                week
                    ? `Неделя ${week.weekKey} · ${formatAiRopMarkPeriod(week)}`
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
            {showState && (
                <AiSectionState
                    status={ropMark.status}
                    error={ropMark.error}
                    loadingText="Подбираем звонки недели…"
                    onRetry={ropMark.retry}
                />
            )}
            {showWeek && ropMark.isEmpty && (
                <div className="flex flex-wrap items-center gap-3 py-2">
                    <p className="text-sm text-muted-foreground">
                        {AI_ROP_MARK_EMPTY_TEXT}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={ropMark.status === 'loading'}
                        onClick={ropMark.pick}
                    >
                        <Shuffle className="h-3 w-3" />
                        Подобрать
                    </Button>
                </div>
            )}
            {showWeek && !ropMark.isEmpty && (
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
