'use client';

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    fetchAiBrief,
    selectAiIsLeader,
    selectAiOverviewScope,
} from '@/modules/entities/ai-analytics';
import { aiBriefScopeKey } from '../lib/ai-brief.util';
import { aiBriefDescription } from '../lib/ai-brief-view.util';

/**
 * Состояние карточки «Итоги периода»: секция brief, периметр обзора
 * (период фильтра ≤ 3 мес. и выбранные менеджеры — thunk считает сам),
 * запрос при монтировании и смене периметра (гарды thunk не дадут дублей;
 * queued/processing дожидается WS в thunk), «Пересобрать» / «Повторить» —
 * force: сервер собирает заново. Подпись карточки — период и сравнение с
 * прошлым периодом (сравнение — только у готовых итогов).
 */
export const useAiBrief = () => {
    const dispatch = useAppDispatch();
    const section = useAppSelector(state => state.aiAnalytics.brief);
    const isLeader = useAppSelector(selectAiIsLeader);
    const scopeKey = useAppSelector(state =>
        aiBriefScopeKey(selectAiOverviewScope(state)?.filters),
    );
    const from = useAppSelector(
        state => selectAiOverviewScope(state)?.filters.from ?? null,
    );
    const to = useAppSelector(
        state => selectAiOverviewScope(state)?.filters.to ?? null,
    );

    useEffect(() => {
        if (!scopeKey) return;
        dispatch(fetchAiBrief());
    }, [dispatch, scopeKey]);

    const rebuild = useCallback(
        () => dispatch(fetchAiBrief({ force: true })),
        [dispatch],
    );

    return {
        ...section,
        isLeader,
        /** Периметр есть (даты фильтра заданы, приложение не публичное). */
        hasScope: scopeKey !== null,
        description: aiBriefDescription(
            { from, to },
            section.status === 'ready' ? section.data : null,
        ),
        rebuild,
        retry: rebuild,
    };
};
