import { appActions } from './AppSlice';
import { AppDispatch, AppGetState, AppThunk } from './store';
import { appInit } from '../lib/initialize/app-init.util';
import { telegramSendMessage } from '@/modules/shared';
import { configureBaseURL } from '@workspace/nest-kpi-report-sales-api';
import { KPI_REPORT_BASE_URL } from '../consts/app-global';

/**
 * Тонкий init-thunk (Alfacentr-паттерн): guard + флаги загрузки.
 * Весь boot — в lib/initialize/app-init.util.ts; последующие загрузки —
 * в listeners (model/listeners/start-store-listeners.ts).
 */
export const initial =
    (): AppThunk =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        configureBaseURL(KPI_REPORT_BASE_URL);
        const app = getState().app;
        if (app.isLoading || app.initialized) return;

        dispatch(appActions.loading({ status: true }));
        try {
            await appInit(dispatch);
        } catch (error) {
            console.error('app-init error:', error);
            dispatch(
                appActions.setInitializedError({
                    errorMessage: 'Ошибка инициализации приложения',
                }),
            );
        } finally {
            dispatch(appActions.loading({ status: false }));
        }
    };

export const reloadApp =
    () => async (dispatch: AppDispatch, _getState: AppGetState) => {
        setTimeout(() => {
            dispatch(appActions.reload());
        }, 1000);
    };

export const sendExpiredStart =
    () => async (dispatch: AppDispatch, _getState: AppGetState) => {
        dispatch(sendToTg('Началась задержка загрузки'));
    };

export const sendExpiredEnd =
    () => async (dispatch: AppDispatch, _getState: AppGetState) => {
        dispatch(sendToTg('Задержка загрузки закончилась'));
    };

export const sendDownloadingReport =
    () => async (dispatch: AppDispatch, _getState: AppGetState) => {
        dispatch(sendToTg('Скачивание отчета excel'));
    };

export const sendToTg =
    (text: string) => async (_dispatch: AppDispatch, getState: AppGetState) => {
        const app = getState().app;
        const user = app.bitrix.user;
        const domain = app.domain;
        const userId = user?.ID?.toString() || '';
        if (user?.NAME || user?.LAST_NAME) {
            text += `\n${user?.NAME || 'name'} ${user?.LAST_NAME || 'last name'}`;
        }

        await telegramSendMessage({ text, domain, userId });
    };
