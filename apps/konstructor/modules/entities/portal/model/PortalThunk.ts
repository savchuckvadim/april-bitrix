import type { IBXDeal } from '@bitrix/domain';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { resolveSwrCache, SWR_DAY_MS } from '@workspace/api';

import { APP_DEP, appActions } from '@/modules/app/model/AppSlice';
import type { RootState } from '@/modules/app/model/store';

import { PortalHelper } from '../lib/api/portal-helper';
import {
    KONSTRUCTOR_PORTAL_QUERY,
    portalFromParts,
} from '../lib/portal-parts.util';
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
 * Портал для конструктора: только части, которые он читает (узкая ручка),
 * собранные в объект прежней формы. Узкая ручка недоступна (бэк ещё не
 * выложен или отвечает ошибкой) — берём полную модель, как раньше: вход в
 * конструктор от новой ручки не зависит.
 */
const fetchPortal = async (domain: string): Promise<Portal> => {
    try {
        return portalFromParts(
            await helper.fetchParts(domain, KONSTRUCTOR_PORTAL_QUERY),
        );
    } catch (error) {
        console.warn(
            'portal: узкая ручка недоступна — берём полную модель',
            error,
        );
        return helper.fetch(domain);
    }
};

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
            fetcher: () => fetchPortal(domain),
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
