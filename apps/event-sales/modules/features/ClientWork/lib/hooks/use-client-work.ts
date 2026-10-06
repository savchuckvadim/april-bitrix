'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getDuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { reloadApp } from '@/modules/app/model/thunk/AppThunk';
import { clientWorkActions } from '../../model/ClientWorkSlice';
import { fetchClientWork, joinClientWork } from '../../model/ClientWorkThunk';
import {
    canSubmitJoin,
    confirmJoinText,
    dealUrl,
} from '../client-work-selection';

/**
 * Состояние и действия блока «Открытые сделки по клиенту». Компонент получает готовые
 * флаги и колбэки и только рисует — ни селекторов, ни условий в вёрстке.
 *
 * Список грузится, когда блок открыли (и при смене сделки): блок
 * показывает руководителю то, что «Возможные пересечения» намеренно
 * скрывают, — другие сделки той же компании.
 *
 * Сам блок теперь «по требованию» (LazySection на экране дела): раньше
 * список запрашивался на каждое открытие сделки — 7–9 запросов сервера в
 * Битрикс, хотя у большинства клиентов сделка одна (разбор нагрузки
 * 05.10.2026). Поэтому блок, раз его открыли, обязан ответить явно: идёт
 * загрузка, сделка одна, не получилось — молчать ему больше нельзя.
 */
export function useClientWork() {
    const dispatch = useAppDispatch();
    const domain = useAppSelector(s => s.app.domain);
    const dealId = useAppSelector(getDuplicateContext).dealId;
    const state = useAppSelector(s => s.clientWork);
    const { data, join } = state;
    const selection = {
        mainDealId: state.mainDealId,
        selectedIds: state.selectedIds,
    };

    // Для этой сделки список уже запрашивали (идёт, получен или упал) —
    // возврат на экран дела повторного запроса не делает: обновляет кнопка
    // в шапке блока, а ⟳ и отработанный отчёт сбрасывают слайс в `idle`.
    const isRequested = state.dealId === dealId && state.status !== 'idle';
    useEffect(() => {
        if (dealId && !isRequested) void dispatch(fetchClientWork());
    }, [dealId, isRequested, dispatch]);

    const deals = data?.deals ?? [];
    const hasSeveral = deals.length > 1;
    const joinDone = join.status === 'done';
    return {
        /** Блок уместен только там, где есть сделка контекста. */
        visible: dealId !== null,
        /**
         * Список получен, и сделка у клиента одна — присоединять нечего.
         * Говорим это словами: блок открыли намеренно, пустая карточка
         * выглядела бы поломкой.
         */
        isSingle: state.status === 'ready' && !hasSeveral && !joinDone,
        isRefreshing: state.status === 'loading',
        isError: state.status === 'error',
        error: state.error,
        clientTitle: data?.client?.title ?? null,
        deals,
        hasSeveral,
        showJoinBar: !!data?.canJoin || joinDone,
        notes: data?.notes ?? [],
        howWorked: data?.howWorked ?? null,
        hint: data?.hint ?? null,
        canJoin: !!data?.canJoin,
        mainDealId: state.mainDealId,
        isSelected: (id: number) => state.selectedIds.includes(id),
        selectedCount: state.selectedIds.length,
        canSubmit: canSubmitJoin(data, selection),
        confirmText: data ? confirmJoinText(data, selection) : '',
        joinStatus: join.status,
        joinError: join.error,
        summary: join.summary,
        mainDealUrl:
            domain && join.summary
                ? dealUrl(domain, join.summary.mainDealId)
                : null,
        dealUrl: (id: number) => (domain ? dealUrl(domain, id) : null),
        refresh: () => dispatch(fetchClientWork()),
        chooseMain: (id: number) =>
            dispatch(clientWorkActions.mainChosen({ dealId: id })),
        toggle: (id: number) =>
            dispatch(clientWorkActions.dealToggled({ dealId: id })),
        arm: () => dispatch(clientWorkActions.joinArmed()),
        disarm: () => dispatch(clientWorkActions.joinDisarmed()),
        confirm: () => dispatch(joinClientWork()),
        reload: () => dispatch(reloadApp()),
    };
}

export type ClientWorkView = ReturnType<typeof useClientWork>;
