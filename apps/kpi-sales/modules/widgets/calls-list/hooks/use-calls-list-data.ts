'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/modules/app';
import {
    callsListErrorOf,
    callsListRequestOf,
    fetchCallsList,
    selectCallsListDomain,
    selectCallsListUserId,
    type CallsListError,
    type CallsListQuery,
    type CallsListResponse,
} from '@/modules/entities/calls-list';

interface CallsListState {
    /** Последняя полученная страница (остаётся на экране, пока грузится новая). */
    data: CallsListResponse | null;
    loading: boolean;
    error: CallsListError | null;
}

const INITIAL: CallsListState = { data: null, loading: false, error: null };

/**
 * Загрузка страницы списка разборов под текущие фильтры. Запрос — от имени
 * реального пользователя сессии; период с ошибкой (`enabled` false) не
 * отправляется. Ответ устаревшего запроса (фильтры успели смениться)
 * отбрасывается. retry — повторить тот же запрос.
 */
export const useCallsListData = (query: CallsListQuery, enabled: boolean) => {
    const domain = useAppSelector(selectCallsListDomain);
    const userId = useAppSelector(selectCallsListUserId);
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<CallsListState>(INITIAL);

    const request = useMemo(
        () =>
            enabled && domain && userId
                ? callsListRequestOf(query, { domain, requesterUserId: userId })
                : null,
        [enabled, domain, userId, query],
    );

    useEffect(() => {
        if (request === null) return;
        let alive = true;
        setState(prev => ({ ...prev, loading: true, error: null }));
        fetchCallsList(request)
            .then(data => {
                if (alive) setState({ data, loading: false, error: null });
            })
            .catch((error: unknown) => {
                if (alive) {
                    setState(prev => ({
                        data: prev.data,
                        loading: false,
                        error: callsListErrorOf(error),
                    }));
                }
            });
        return () => {
            alive = false;
        };
    }, [request, attempt]);

    const retry = useCallback(() => setAttempt(value => value + 1), []);

    return { ...state, retry, waiting: request === null };
};
