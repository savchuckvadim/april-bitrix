import type { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { Catalog } from '../../catalog';
import { rowSetActions, type RowSetState } from './RowSetSlice';
import { syncAcademyRow, syncSetWithComposition } from '../lib/set';

/**
 * Реакции row-set (регистрируются app-слоем в start-store-listeners).
 * Типизация — структурная (WithRowSetDeps), чтобы entity не тянула RootState.
 */

interface WithRowSetDeps {
    rowSet: RowSetState;
    catalog: { catalog: Catalog };
}

interface ListenerApiLike {
    dispatch: (action: unknown) => unknown;
    getState: () => WithRowSetDeps;
    getOriginalState: () => WithRowSetDeps;
}

type StartListening = (options: unknown) => void;

const loose = (listenerMiddleware: ListenerMiddlewareInstance): StartListening =>
    listenerMiddleware.startListening as unknown as StartListening;

const setOf = (state: WithRowSetDeps, setId: string) =>
    state.rowSet.general.id === setId
        ? state.rowSet.general
        : state.rowSet.alternative.find(item => item.id === setId);

/**
 * Наполнение строки или регион изменились → пересобрать затронутые сеты:
 * garant-цены + производные сервисные строки (LT-пакет, консалтинг, СТАР,
 * академия). Замена легаси changeCurrentProductAndPrice/setGeneralProductRows.
 * ВАЖНО: setContext матчится ТОЛЬКО при смене региона — смена налога идёт
 * через setWithTax + provider-tax listener (без пересборки по каталогу,
 * чтобы не убить денормализованные цены восстановленного слепка).
 * restore НЕ матчится — сохранённые цены слепка не пересчитываются.
 */
export function setupRowSetSyncListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    loose(listenerMiddleware)({
        matcher: (action: {
            type: string;
            payload?: { regionCode?: string };
        }) =>
            action.type === rowSetActions.setRowComposition.type ||
            action.type === rowSetActions.upsertRow.type ||
            action.type === rowSetActions.resyncSet.type ||
            (action.type === rowSetActions.setContext.type &&
                action.payload?.regionCode !== undefined),
        effect: (
            action: { type: string; payload?: { setId?: string } },
            listenerApi: ListenerApiLike,
        ) => {
            const state = listenerApi.getState();
            const { catalog } = state.catalog;
            const { context, general, alternative } = state.rowSet;
            if (!context.regionCode) return;

            const targetSetIds =
                action.type === rowSetActions.setContext.type
                    ? [general.id, ...alternative.map(set => set.id)]
                    : action.payload?.setId
                      ? [action.payload.setId]
                      : [];

            for (const setId of targetSetIds) {
                const set = setOf(state, setId);
                if (!set) continue;
                const synced = syncSetWithComposition(set, catalog, context);
                if (synced !== set) {
                    listenerApi.dispatch(rowSetActions.writeSyncedSet(synced));
                }
            }
        },
    });
}

/**
 * Количество в наборе изменилось → изменился срок сделки (количество ×
 * договор), и пакет академии «на срок» мог перестать подходить или снова
 * подойти. Пересобирается одна строка академии: остальные строки и ручные
 * правки цен не трогаем. Легаси useAcademyQuantityListener убирал пакет и
 * возвращал его из памяти экрана; здесь выбор живёт в наполнении, строка
 * появляется, когда срок совпал.
 */
export function setupAcademyTermListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    loose(listenerMiddleware)({
        matcher: (action: { type: string; payload?: { edit?: { kind?: string } } }) =>
            (action.type === rowSetActions.editRowCommercial.type ||
                action.type === rowSetActions.editTotalCommercial.type) &&
            action.payload?.edit?.kind === 'quantity',
        effect: (
            action: { payload: { setId: string } },
            listenerApi: ListenerApiLike,
        ) => {
            const state = listenerApi.getState();
            const set = setOf(state, action.payload.setId);
            if (!set) return;
            const synced = syncAcademyRow(set, state.catalog.catalog, state.rowSet.context);
            if (synced !== set) {
                listenerApi.dispatch(rowSetActions.writeSyncedSet(synced));
            }
        },
    });
}
