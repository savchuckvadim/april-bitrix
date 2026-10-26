import { Bitrix } from '@workspace/bitrix';
import { Placement } from '@workspace/bx';
import {
    IS_PROD,
    DEV_PLACEMENT_HINT,
    HAS_DEV_PLACEMENT,
    TESTING_DOMAIN,
    TESTING_PLACEMENT,
    TESTING_USER,
} from '../../../consts/app-global';
import type { AppDispatch } from '../../../model/store';
import { appActions } from '../../../model/AppSlice';
import { bitrixInit } from '../bitrix-init/bitrix-init.util';
import {
    COMPANY_DEAL_SELECT,
    pickCompanyDeal,
    resolvePlacementEntity,
    type PlacementEntity,
} from './placement-entity.util';

/** Код ошибки инициализации «не во фрейме Bitrix в PROD». */
export const NON_AUTH_ERROR = 'nonauth';

/** Код ошибки инициализации «в сделке не указана компания». */
export const NO_COMPANY_ERROR = 'nocompany';

/** Код ошибки инициализации «открыто из компании, а сделок у неё нет». */
export const NO_DEAL_ERROR = 'nodeal';

/**
 * dealId по сущности placement: из сделки — её ID; из компании — её сделка
 * (открытая и самая свежая) через crm.deal.list по COMPANY_ID (решение 5).
 * null — компания без сделок (или REST недоступен).
 */
const resolveDealId = async (entity: PlacementEntity): Promise<number | null> => {
    if (!entity) return null;
    if (entity.kind === 'deal') return entity.id;
    try {
        const response = await Bitrix.getService().deal.getList(
            { COMPANY_ID: String(entity.id) },
            COMPANY_DEAL_SELECT,
            { DATE_CREATE: 'DESC' },
        );
        return pickCompanyDeal(response?.result ?? [])?.ID ?? null;
    } catch (error) {
        console.warn('app-init: сделки компании недоступны', error);
        return null;
    }
};

/**
 * Boot-последовательность: Bitrix.start (во фрейме — реальные domain/user,
 * вне фрейма — TESTING_*) → placement → dealId → сделка+компания → setAppData.
 * setAppData — единый триггер для listeners (каталог, портал, слепок сделки,
 * реквизиты, поставщики).
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
    // Вне фрейма без тестового портала/сделки в env — не угадываем, а просим настроить.
    if (!inFrame && !HAS_DEV_PLACEMENT) {
        dispatch(appActions.setInitializedError({ errorMessage: DEV_PLACEMENT_HINT }));
        return;
    }

    const domain = authDomain || TESTING_DOMAIN;
    const user = authUser ?? TESTING_USER;
    if (!inFrame) {
        console.info(`app-init: вне фрейма Bitrix — dev-режим (${domain})`);
    }

    const placement =
        bitrix.api.getPlacement() || (TESTING_PLACEMENT as Placement);
    const entity = resolvePlacementEntity(placement);
    const dealId = await resolveDealId(entity);

    // Из карточки компании без единой сделки конструктору нечего открывать.
    if (entity?.kind === 'company' && !dealId) {
        dispatch(appActions.setInitializedError({ errorMessage: NO_DEAL_ERROR }));
        return;
    }

    // Сделка+компания из Bitrix REST — best-effort: в dev против чужого
    // портала REST может быть недоступен, init не должен падать.
    let deal = null;
    let company = null;
    if (dealId) {
        try {
            const bxResult = await bitrixInit(dealId);
            deal = bxResult?.deal ?? null;
            company = bxResult?.company ?? null;
        } catch (error) {
            console.warn('app-init: bitrix deal/company недоступны', error);
        }
    }

    // Без компании не собрать ни реквизиты, ни документы — дальше идти незачем.
    // Проверяем только когда сделка реально прочиталась: deal === null означает
    // «REST недоступен», а не «компании нет».
    if (deal && !company) {
        dispatch(
            appActions.setInitializedError({ errorMessage: NO_COMPANY_ERROR }),
        );
        return;
    }

    dispatch(appActions.setAppData({ domain, user, deal, company, dealId }));
};
