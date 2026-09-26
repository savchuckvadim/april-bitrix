'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    useAppDispatch,
    useAppSelector,
    selectIsRealSuperUser,
    selectIsViewAs,
} from '@/modules/app';
import {
    fetchAiRopMarkWeek,
    saveAiRopMark,
    selectAiIsLeader,
    type AiRopMarkInput,
} from '@/modules/entities/ai-analytics';
import { repickAiRopMarkWeek } from '@/modules/entities/ai-analytics/model/ai-analytics-rop-mark.thunks';
import {
    aiRopMarkCardView,
    aiRopMarkErrorView,
} from '../lib/ai-rop-mark-state.util';
import { aiRopMarkAccess } from '../lib/ai-rop-mark-access.util';

/**
 * Карточка слепой оценки: секция ropMark (list; при пустом подборе thunk
 * сам делает pick), режим карточки (aiRopMarkCardView), состояние записи
 * метки, повтор, «Подобрать» (list с force) и «Подобрать заново» (pick с
 * forceRefresh, когда подбор вышел без звонков). Только руководителю: не
 * руководителю запрос не шлём (сервер ответил бы 403) — карточка не
 * рендерится. В режиме «Смотреть как…» записи неактивны с подсказкой;
 * суперпользователю вендора кнопки записи не показываем (бэк ответил бы
 * 403) — вместо них строка «только чтение» (aiRopMarkAccess).
 */
export const useAiRopMark = () => {
    const dispatch = useAppDispatch();
    const isLeader = useAppSelector(selectAiIsLeader);
    const isViewAs = useAppSelector(selectIsViewAs);
    const isRealSuperUser = useAppSelector(selectIsRealSuperUser);
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

    const repick = useCallback(
        () => dispatch(repickAiRopMarkWeek()),
        [dispatch],
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
        view: aiRopMarkCardView(section.status, section.data),
        errorView: aiRopMarkErrorView(section.error),
        week: section.data,
        query,
        /** readOnlyHint («Смотреть как…»), superUserHint, showWriteControls. */
        ...aiRopMarkAccess(isViewAs, isRealSuperUser),
        retry: reload,
        pick: reload,
        repick,
        save,
        savePending: saveState.pending,
        saveError: saveState.error,
        lastSaved: saveState.lastSaved,
        lastCallId,
    };
};
