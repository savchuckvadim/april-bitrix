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
 * Список грузится сам при открытии сделки (и при смене сделки): блок
 * показывает руководителю то, что «Возможные пересечения» намеренно
 * скрывают, — другие сделки той же компании.
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

    useEffect(() => {
        if (dealId) void dispatch(fetchClientWork());
    }, [dealId, dispatch]);

    const deals = data?.deals ?? [];
    const hasSeveral = deals.length > 1;
    const joinDone = join.status === 'done';
    return {
        /**
         * Блок есть только у сделки клиента с несколькими открытыми сделками
         * (или сразу после присоединения — показать итог). Первая загрузка и
         * её сбой тихие, как автопоиск дублей: у большинства клиентов сделка
         * одна, и пустая карточка в узкой колонке была бы шумом.
         */
        visible: dealId !== null && (hasSeveral || joinDone),
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
