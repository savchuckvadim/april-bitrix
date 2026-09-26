'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    fetchAiRopMarkWeek,
    isAiRopMarkWeekEmpty,
    saveAiRopMark,
    selectAiIsLeader,
    type AiRopMarkInput,
} from '@/modules/entities/ai-analytics';

/**
 * Карточка слепой оценки: секция ropMark (list; при пустом подборе thunk
 * сам делает pick), состояние записи метки, повтор и «Подобрать» с force.
 * Только руководителю: не руководителю запрос не шлём (сервер ответил бы
 * 403) — карточка не рендерится. Данные секции остаются на экране, пока
 * идёт перечитка после метки.
 */
export const useAiRopMark = () => {
    const dispatch = useAppDispatch();
    const isLeader = useAppSelector(selectAiIsLeader);
    const section = useAppSelector(state => state.aiAnalytics.ropMark);
    const query = useAppSelector(state => state.aiAnalytics.ropMarkQuery);
    const saveState = useAppSelector(state => state.aiAnalytics.ropMarkSave);
    /** Звонок последней попытки записи — к нему привязаны ошибка и заметки. */
    const [lastCallId, setLastCallId] = useState<string | null>(null);

    useEffect(() => {
        if (isLeader && section.status === 'idle') {
            void dispatch(fetchAiRopMarkWeek());
        }
    }, [dispatch, isLeader, section.status]);

    /** Повтор после ошибки и «Подобрать»: list с force → pick при пустом. */
    const reload = useCallback(
        () => dispatch(fetchAiRopMarkWeek(query ?? {}, true)),
        [dispatch, query],
    );

    const save = useCallback(
        (input: AiRopMarkInput): Promise<boolean> => {
            setLastCallId(input.transcriptionId);
            return dispatch(saveAiRopMark(input));
        },
        [dispatch],
    );

    return {
        isLeader,
        status: section.status,
        error: section.error,
        week: section.data,
        isEmpty: !!section.data && isAiRopMarkWeekEmpty(section.data),
        query,
        retry: reload,
        pick: reload,
        save,
        savePending: saveState.pending,
        saveError: saveState.error,
        lastSaved: saveState.lastSaved,
        lastCallId,
    };
};
