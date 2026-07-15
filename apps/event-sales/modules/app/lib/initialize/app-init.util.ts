import { Bitrix } from '@workspace/bitrix';
import { BXTask, BXUser, Placement } from '@workspace/bx';
import { portalAPI } from '@workspace/pbx';
import {
    DEV_CURRENT_USER_ID,
    TESTING_DOMAIN,
    TESTING_PLACEMENT,
    TESTING_USER,
} from '../../consts/app-global';
import { appActions } from '../../model/slice/AppSlice';
import { AppDispatch, AppGetState } from '../../model/store';
import { getDisplayMode, getEntitiesFromPlacement } from '../utills/placement-util';
import { initAppEntities, initAppTask } from '../utills/app-setup-util';
import {
    getDepartment,
    setDepartmentMode,
} from '@/modules/features/Departament/model/DepartmentThunk';

/**
 * Boot-последовательность приложения (Alfacentr-паттерн: тонкий thunk +
 * этот util). `Bitrix.start` прозрачно работает в обоих режимах:
 * во фрейме Bitrix берёт реальные domain/user/placement, локально (без
 * клиентского Bitrix в браузере) — падает на переданные TESTING_*.
 * Режим виден по `inFrame` из `getInitializedData()`.
 *
 * Побочные реакции на загруженные данные (портал → компания и т.п.)
 * живут в listeners (model/listeners), а не во вложенных thunk'ах.
 */
export const appInit = async (dispatch: AppDispatch, getState: AppGetState) => {
    const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
    await bitrix.api.getFit();

    const { domain: authDomain, user: authUser, inFrame } = bitrix.api.getInitializedData();
    const domain = authDomain || TESTING_DOMAIN;
    const user = (authUser ?? TESTING_USER) as unknown as BXUser;
    const placement = (bitrix.api.getPlacement() ?? TESTING_PLACEMENT) as Placement;

    if (!inFrame) {
        console.info(`app-init: вне фрейма Bitrix — dev-режим (${domain})`);
    }

    dispatch(setDepartmentMode(user, domain));

    // Resolve the CRM entities for the current placement via @workspace/bitrix services.
    const entities = await getEntitiesFromPlacement(placement, domain);
    const display = getDisplayMode(placement);

    if (!entities.currentCompany && !entities.currentLead) {
        dispatch(appActions.setInitializedError({ errorMessage: 'Компания не найдена' }));
        return;
    }

    initAppEntities(dispatch, entities, domain, user, placement, display);

    const userId = Number(user?.ID || DEV_CURRENT_USER_ID);
    const companyId = Number(
        entities.currentCompany?.ID || entities.companyPlacement.options.ID || 0,
    );

    initAppTask(
        dispatch,
        entities.currentTask as unknown as BXTask | null,
        domain,
        userId,
        companyId,
    );

    dispatch(getDepartment(domain, user));
    dispatch(portalAPI.endpoints.fetchPortal.initiate({ domain }));
    dispatch(appActions.setInitializedSuccess({}));
};
