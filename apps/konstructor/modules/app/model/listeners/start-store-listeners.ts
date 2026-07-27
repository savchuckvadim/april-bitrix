import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import { rowSetActions } from '@/modules/entities/row-set';
import { syncSetWithComposition } from '@/modules/entities/row-set';

/**
 * Единая точка регистрации реакций «X случилось → сделать Y»
 * (правило монорепы: listeners вместо вложенных thunk'ов).
 */
export function startStoreListeners(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    setupRowSetSyncListener(listenerMiddleware);
}

/**
 * Наполнение строки или контекст цен (регион/налог) изменились →
 * пересобрать затронутые сеты: garant-цены + производные сервисные строки
 * (LT-пакет, консалтинг, СТАР, академия). Замена легаси
 * changeCurrentProductAndPrice/setGeneralProductRows.
 */
function setupRowSetSyncListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    const startListening = listenerMiddleware.startListening as unknown as (
        options: unknown,
    ) => void;

    startListening({
        matcher: (action: { type: string }) =>
            action.type === rowSetActions.setRowComposition.type ||
            action.type === rowSetActions.setContext.type ||
            action.type === rowSetActions.upsertRow.type,
        effect: (
            action: { type: string; payload?: { setId?: string } },
            listenerApi: {
                dispatch: AppDispatch;
                getState: () => RootState;
            },
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
