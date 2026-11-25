import type { AppThunk } from '@/modules/app/model/store';
import { PORTAL_VIEW_TEXT } from '../consts/portal-view.texts';
import { fetchPortalView, savePortalViewSettings } from '../lib/api/portal-view-api';
import { portalViewSaveErrorMessage } from '../lib/portal-view-error';
import { portalViewActions } from './portal-view-slice';
import {
    selectCanEditPortalView,
    selectPortalViewRequest,
} from './portal-view.selectors';
import type { PortalViewSaveBody } from './types';

/**
 * Загрузка настроек вида отчёта. Сбой не ломает приложение: остаются
 * безопасные значения по умолчанию, в консоль уходит одно предупреждение.
 */
export const loadPortalView = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const request = selectPortalViewRequest(getState());
    if (!request) return;
    dispatch(portalViewActions.loadStarted());
    try {
        dispatch(portalViewActions.loaded(await fetchPortalView(request)));
    } catch (error) {
        console.warn(`[portal-view] ${PORTAL_VIEW_TEXT.errors.loadFailed}`, error);
        dispatch(portalViewActions.loadFailed());
    }
};

/**
 * Сохранение настроек. Успех — состояние заменяется ответом бэка; сбой —
 * в стор уходит понятный текст, форма на странице остаётся как есть.
 * Возвращает, удалось ли сохранить. Вне прав (нет доступа, «Смотреть как…»)
 * запрос не отправляется.
 */
export const savePortalView =
    (body: PortalViewSaveBody): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const state = getState();
        const request = selectPortalViewRequest(state);
        if (!request) {
            dispatch(portalViewActions.saveFailed(PORTAL_VIEW_TEXT.errors.noSession));
            return false;
        }
        if (!selectCanEditPortalView(state)) {
            dispatch(portalViewActions.saveFailed(PORTAL_VIEW_TEXT.errors.forbidden));
            return false;
        }
        dispatch(portalViewActions.saveStarted());
        try {
            const response = await savePortalViewSettings({ ...request, ...body });
            dispatch(portalViewActions.saved(response));
            return true;
        } catch (error) {
            dispatch(portalViewActions.saveFailed(portalViewSaveErrorMessage(error)));
            return false;
        }
    };
