import { appActions } from '../slice/AppSlice';
import { AppDispatch, AppGetState } from '../store';
import { appInit } from '../../lib/initialize/app-init.util';

/**
 * Тонкий оркестратор boot'а (Alfacentr-паттерн): guard + loading-флаги,
 * вся работа — в lib/initialize/app-init.util.ts.
 */
export const initial = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    if (state.app.isLoading || state.app.initialized) return;

    dispatch(appActions.isLoading({ status: true }));

    try {
        await appInit(dispatch, getState);
    } catch (error) {
        console.error('app init error', error);
        dispatch(appActions.setInitializedError({ errorMessage: 'Ошибка инициализации приложения' }));
    } finally {
        dispatch(appActions.isLoading({ status: false }));
    }
};

export const reloadApp = () => async (dispatch: AppDispatch) => {
    // Reset the app shell; `useApp` re-runs `initial()` once `initialized` is false.
    dispatch(appActions.reload());
};
