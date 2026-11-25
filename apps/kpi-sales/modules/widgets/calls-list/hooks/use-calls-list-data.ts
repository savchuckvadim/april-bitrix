'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/modules/app';
import {
    CALLS_LIST_DEBOUNCE_MS,
    callsListErrorOf,
    callsListRequestOf,
    fetchCallsList,
    isCallsListRequestImmediate,
    selectCallsListDomain,
    selectCallsListUserId,
    type CallsListError,
    type CallsListQuery,
    type CallsListResponse,
} from '@/modules/entities/calls-list';
import { useDebouncedValue } from '@/modules/shared/lib/hooks/use-debounced-value';

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
 * отправляется. Первая загрузка и смена страницы уходят сразу, правка
 * фильтров, бейджей или порядка — после паузы (серия нажатий — один запрос).
 * Каждый новый запрос отменяет прошлый; ответ устаревшего запроса отбрасывается,
 * отмена ошибкой не показывается. Пока идёт пауза или запрос, `loading`
 * истинно, а прошлая страница остаётся на экране. retry — повторить тот же
 * запрос.
 */
export const useCallsListData = (query: CallsListQuery, enabled: boolean) => {
    const domain = useAppSelector(selectCallsListDomain);
    const userId = useAppSelector(selectCallsListUserId);
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState<CallsListState>(INITIAL);
    const requested = useDebouncedValue(
        query,
        CALLS_LIST_DEBOUNCE_MS,
        isCallsListRequestImmediate,
    );

    const request = useMemo(
        () =>
            enabled && domain && userId
                ? callsListRequestOf(requested, { domain, requesterUserId: userId })
                : null,
        [enabled, domain, userId, requested],
    );

    useEffect(() => {
        if (request === null) return;
        let alive = true;
        const controller = new AbortController();
        setState(prev => ({ ...prev, loading: true, error: null }));
        fetchCallsList(request, controller.signal)
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
            controller.abort();
        };
    }, [request, attempt]);

    const retry = useCallback(() => setAttempt(value => value + 1), []);
    // Пауза после правки фильтров: страница на экране ещё прошлая.
    const pending = requested !== query;

    return {
        ...state,
        loading: state.loading || pending,
        retry,
        waiting: request === null,
    };
};
