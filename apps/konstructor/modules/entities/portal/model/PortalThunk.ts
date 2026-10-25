import type { IBXDeal } from '@bitrix/domain';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { resolveSwrCache, SWR_DAY_MS } from '@workspace/api';

import { APP_DEP, appActions } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';

import { PortalHelper } from '../lib/api/portal-helper';
import { getIsServiceDepartment } from '../lib/portal-util';
import type { Portal } from './dto';
import { setPortal } from './PortalSlice';

export type InitPortalArgs = {
    domain: string;
    deal: IBXDeal | null;
};

/** Версия схемы слепка в кэше: меняем, когда меняется форма FrontPortalDto. */
const PORTAL_CACHE_VERSION = 2;

const helper = new PortalHelper();

/**
 * Слепок портала (pbx-сущности) с нашего бэка через swrCache: свежее — сразу,
 * протухшее — сразу и обновление в фоне, неудача обновления оставляет старое.
 * Домен в ключе обязателен — два портала в одном браузере не делят запись.
 * Сделка в сервисной воронке переключает app.department.
 */
export const initPortal = createAsyncThunk<
    Portal | null,
    InitPortalArgs,
    { state: RootState; rejectValue: string }
>('portal/init', async ({ domain, deal }, { dispatch, rejectWithValue }) => {
    try {
        const { value: portal } = await resolveSwrCache<Portal>({
            key: { name: 'portal', domain, version: PORTAL_CACHE_VERSION },
            staleAfterMs: SWR_DAY_MS,
            fetcher: () => helper.fetch(domain),
            onUpdate: fresh => dispatch(setPortal(fresh)),
        });

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
