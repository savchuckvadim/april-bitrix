import type { IBXCompany, IBXDeal } from '@bitrix/domain';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_METHOD, onlineGeneralAPI } from '@workspace/api';

import { APP_DEP, appActions } from '@/modules/app/model/AppSlice';
import { TESTING_DOMAIN } from '@/modules/app/consts/app-global';
import type { RootState, ThunkExtraArgument } from '@/modules/app';

import { getIsServiceDepartment } from '../lib/portal-util';
import {
    getFromLocalStorage,
    getStorageKey,
    removeOldPortalCache,
    saveToLocalStorage,
} from '../lib/store-portal-util';
import type { Portal } from '../type/portal.type';

export type InitPortalArgs = {
    domain: string;
    company: IBXCompany | null;
    deal: IBXDeal | null;
    currentUserId: number;
};

/**
 * Загрузка портала (кэш + online API), обновление app.department при сервисной воронке.
 * Цепочки event/company/pbx из старого проекта сюда не перенесены — подключите по мере появления модулей в konstructor.
 */
export const initPortal = createAsyncThunk<
    Portal | null,
    InitPortalArgs,
    { state: RootState; rejectValue: string; extra: ThunkExtraArgument }
>('portal/init', async (args, { dispatch, rejectWithValue }) => {
    try {
        const { domain, deal, currentUserId } = args;

        const getPortaldata = {
            domain: domain || TESTING_DOMAIN,
            userId: currentUserId,
        };
        const localPrefix = 'portal_cache';
        const storageKey = getStorageKey(localPrefix);
        const secretKey = getPortaldata.domain || 'nmbrsdntl';
        removeOldPortalCache(localPrefix);

        let portal: Portal | null = (await getFromLocalStorage(storageKey, secretKey)) as Portal | null;

        if (!portal) {
            portal = (await onlineGeneralAPI.service(
                'front/portal',
                API_METHOD.POST,
                'portal',
                getPortaldata,
            )) as Portal | null;

            await saveToLocalStorage(storageKey, portal, secretKey);
        }

        const isServiceDepartment = getIsServiceDepartment(portal, deal);
        if (isServiceDepartment) {
            dispatch(appActions.setDepartment(APP_DEP.SERVICE));
        }

        return portal;
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Portal init failed';
        return rejectWithValue(message);
    }
});
