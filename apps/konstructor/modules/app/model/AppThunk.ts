import { appActions } from './AppSlice';
import type { AppDispatch, AppGetState, AppThunk } from './store';

import { appInit } from '../lib/initialize/app-init/app-init.util';

/**
 * Тонкий boot-thunk (паттерн kpi-sales): гард + флаги загрузки → app-init.util.
 * Загрузки данных (каталог, шаблоны, слепок сделки) — listeners на setAppData
 * в model/listeners/start-store-listeners.ts, thunk о них не знает.
 */
export const initial =
    (): AppThunk =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            const { isLoading, initialized } = getState().app;
            if (isLoading || initialized) return;

            dispatch(appActions.loading({ status: true }));
            try {
                await appInit(dispatch);
            } catch (error) {
                dispatch(
                    appActions.setInitializedError({
                        errorMessage:
                            error instanceof Error
                                ? error.message
                                : 'app init failed',
                    }),
                );
            } finally {
                dispatch(appActions.loading({ status: false }));
            }
        };

export const reloadApp =
    (): AppThunk =>
        async (dispatch: AppDispatch) => {
            dispatch(appActions.reload());
            dispatch(initial());
        };
