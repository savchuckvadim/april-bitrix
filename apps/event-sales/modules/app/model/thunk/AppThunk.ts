import { Bitrix } from '@workspace/bitrix';
import type { BXCompany } from '@workspace/bx';
import { appActions } from '../slice/AppSlice';
import type { AppDispatch, AppGetState } from '../store';
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

/**
 * Подтянуть компанию в состояние ПОСЛЕ инициализации — без полного reload.
 *
 * Главный потребитель — сценарий «привязали компанию к сделке посреди
 * сессии» (виджет «нет компании» / фича ИНН): раньше setAppBitrixData нигде
 * не диспатчился, и приложение до перезагрузки жило в no-company режиме.
 * Реакции (поля компании, контакты) — листенером на setAppBitrixData.
 */
export const refreshBitrixCompany =
    (companyId: number) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        try {
            const company = (await Bitrix.getService().company.get(
                companyId,
            )) as unknown as BXCompany | null;
            if (!company) return;
            dispatch(
                appActions.setAppBitrixData({
                    company,
                    deal: getState().app.bitrix.deal,
                }),
            );
        } catch (error) {
            console.error('refreshBitrixCompany error', error);
        }
    };
