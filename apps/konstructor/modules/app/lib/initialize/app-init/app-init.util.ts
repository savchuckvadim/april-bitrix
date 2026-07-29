import { Bitrix } from '@workspace/bitrix';
import { Placement } from '@workspace/bx';
import {
    IS_PROD,
    TESTING_DOMAIN,
    TESTING_PLACEMENT,
    TESTING_USER,
} from '../../../consts/app-global';
import { AppDispatch } from '../../../model/store';
import { WSClient } from '@/modules/shared';
import { appActions } from '../../../model/AppSlice';
import { bitrixInit } from '../bitrix-init/bitrix-init.util';
import { wsInit } from '../../../model/ws/Websocket';

/** Код ошибки инициализации «не во фрейме Bitrix в PROD». */
export const NON_AUTH_ERROR = 'nonauth';

/** Структурный минимум placement (Placement | CustomPlacement из @workspace/bx) */
interface PlacementLike {
    placement: string;
    options: unknown;
}

/**
 * ID сделки из placement. COMPANY/LEAD-плейсменты пока не резолвят сделку
 * (легаси ходил в hookAPI full/document/company/deals — отложено, см. docs).
 */
const resolveDealIdFromPlacement = (
    placement: PlacementLike | null,
): number | null => {
    if (!placement?.options || typeof placement.options !== 'object')
        return null;
    if (!String(placement.placement || '').includes('DEAL')) return null;
    const options = placement.options as Record<string, unknown>;
    const raw =
        'ID' in options ? options.ID : 'dealId' in options ? options.dealId : null;
    const dealId = Number(raw);
    return Number.isFinite(dealId) && dealId > 0 ? dealId : null;
};

/**
 * Boot-последовательность: Bitrix.start (во фрейме — реальные domain/user,
 * вне фрейма — TESTING_*) → placement → dealId → WS → setAppData.
 * setAppData — единый триггер для listeners (каталог, шаблоны, слепок сделки).
 */
export const appInit = async (dispatch: AppDispatch) => {
    const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
    const {
        domain: authDomain,
        user: authUser,
        inFrame,
    } = bitrix.api.getInitializedData();

    if (!inFrame && IS_PROD) {
        dispatch(appActions.setInitializedError({ errorMessage: NON_AUTH_ERROR }));
        return;
    }

    const domain = authDomain || TESTING_DOMAIN;
    const user = authUser ?? TESTING_USER;
    if (!inFrame) {
        console.info(`app-init: вне фрейма Bitrix — dev-режим (${domain})`);
    }

    const placement =
        bitrix.api.getPlacement() || (TESTING_PLACEMENT as Placement);
    const dealId = resolveDealIdFromPlacement(placement);

    const wsService = new WSClient(Number(user.ID), domain);
    wsService.init();
    dispatch(wsInit({ userId: Number(user.ID), domain }));

    // Сделка+компания из Bitrix REST — best-effort: в dev против чужого
    // портала REST может быть недоступен, init не должен падать.
    let deal = null;
    let company = null;
    try {
        const bxResult = await bitrixInit();
        deal = bxResult?.deal ?? null;
        company = bxResult?.company ?? null;
    } catch (error) {
        console.warn('app-init: bitrix deal/company недоступны', error);
    }

    dispatch(appActions.setAppData({ domain, user, deal, company, dealId }));
};
