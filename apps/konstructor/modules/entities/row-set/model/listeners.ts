import type { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { Catalog } from '../../catalog';
// Прямой импорт слайса (не баррель) — баррель provider тянет thunks с @workspace/api
import { documentProvidertAC } from '../../provider/model/DocumentProviderSlice';
import type { DocumentProviderState } from '../../provider/model/DocumentProviderSlice';
import { rowSetActions, type RowSetState } from './RowSetSlice';
import type { RowSet } from './types';
import {
    applySetTaxChange,
    detectDroppedAcademy,
    syncSetWithComposition,
} from '../lib/set';

/**
 * Реакции row-set (регистрируются app-слоем в start-store-listeners).
 * Типизация — структурная (WithRowSetDeps), чтобы entity не тянула RootState.
 */

interface WithRowSetDeps {
    rowSet: RowSetState;
    catalog: { catalog: Catalog };
    documentProvider: DocumentProviderState;
}

interface ListenerApiLike {
    dispatch: (action: unknown) => unknown;
    getState: () => WithRowSetDeps;
    getOriginalState: () => WithRowSetDeps;
}

type StartListening = (options: unknown) => void;

const loose = (listenerMiddleware: ListenerMiddlewareInstance): StartListening =>
    listenerMiddleware.startListening as unknown as StartListening;

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
                const set =
                    general.id === setId
                        ? general
                        : alternative.find(item => item.id === setId);
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
 * Смена поставщика → массовый пересчёт налога ×1.05/÷1.05 по всем сетам
 * (легаси changeProviderTax): LIC и бесплатные строки пропускаются,
 * ручные скидки сохраняются, слепки не пересобираются по каталогу.
 */
export function setupProviderTaxListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    loose(listenerMiddleware)({
        matcher: (action: { type: string }) =>
            action.type === documentProvidertAC.setCurrent.type ||
            action.type === documentProvidertAC.setFetched.type ||
            action.type === documentProvidertAC.setInit.type,
        effect: (_action: unknown, listenerApi: ListenerApiLike) => {
            const state = listenerApi.getState();
            const nowTaxed = Boolean(state.documentProvider.current?.withTax);
            const wasTaxed = state.rowSet.context.withTax;
            if (nowTaxed === wasTaxed) return;

            const { catalog } = state.catalog;
            listenerApi.dispatch(rowSetActions.setWithTax(nowTaxed));
            for (const set of [
                state.rowSet.general,
                ...state.rowSet.alternative,
            ]) {
                if (!set.rows.length) continue;
                listenerApi.dispatch(
                    rowSetActions.writeSyncedSet(
                        applySetTaxChange(set, catalog, wasTaxed, nowTaxed),
                    ),
                );
            }
        },
    });
}

/**
 * Академия выпала при пересборке сета (договор вне срока пакета) →
 * почистить composition.academy у garant-строк, чтобы выбор не «висел»
 * призраком (чистая замена легаси React-эффекта useAcademyQuantityListener).
 * Сходится за один доп. цикл: после очистки академии в сете уже нет.
 */
export function setupAcademyDurationListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    loose(listenerMiddleware)({
        matcher: (action: { type: string }) =>
            action.type === rowSetActions.writeSyncedSet.type,
        effect: (
            action: { payload: RowSet },
            listenerApi: ListenerApiLike,
        ) => {
            const synced = action.payload;
            const prevState = listenerApi.getOriginalState();
            const prev =
                prevState.rowSet.general.id === synced.id
                    ? prevState.rowSet.general
                    : prevState.rowSet.alternative.find(
                          set => set.id === synced.id,
                      );
            if (!prev || !detectDroppedAcademy(prev, synced)) return;

            for (const row of synced.rows) {
                if (row.productType !== 'garant' || !row.composition?.academy)
                    continue;
                listenerApi.dispatch(
                    rowSetActions.setRowComposition({
                        setId: synced.id,
                        key: row.key,
                        composition: { ...row.composition, academy: null },
                    }),
                );
            }
        },
    });
}
