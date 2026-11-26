import type { IBXDeal } from '@bitrix/domain';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { APP_DEP, appActions } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';

import { loadPortalSnapshot } from '../lib/portal-snapshot.util';
import { getIsServiceDepartment } from '../lib/portal-util';
import type { Portal } from './dto';
import { setPortal } from './PortalSlice';

export type InitPortalArgs = {
    domain: string;
    deal: IBXDeal | null;
};

/**
 * Слепок портала (pbx-сущности) с нашего бэка через swrCache (см.
 * loadPortalSnapshot). Сделка в сервисной воронке переключает app.department.
 */
export const initPortal = createAsyncThunk<
    Portal | null,
    InitPortalArgs,
    { state: RootState; rejectValue: string }
>('portal/init', async ({ domain, deal }, { dispatch, rejectWithValue }) => {
    try {
        const { value: portal } = await loadPortalSnapshot(domain, fresh =>
            dispatch(setPortal(fresh)),
        );

        if (getIsServiceDepartment(portal, deal)) {
            dispatch(appActions.setDepartment(APP_DEP.SERVICE));
        }

        return portal;
    } catch (error) {
        return rejectWithValue(
            error instanceof Error ? error.message : 'Portal init failed',
        );
    }
});
