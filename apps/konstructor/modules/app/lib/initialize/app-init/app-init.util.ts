import type { IBXCompany, IBXDeal } from '@bitrix/index';
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
import { bootstrapPortalSession } from '../../portal-session/portal-session';
import { readCompany } from '../../services/bx-company-entry.service';
import { resolveCompanyDealId } from './company-entry.util';
import { resolvePlacementEntity } from './placement-entity.util';

/** Код ошибки инициализации «не во фрейме Bitrix в PROD». */
export const NON_AUTH_ERROR = 'nonauth';

/** Код ошибки инициализации «в сделке не указана компания». */
export const NO_COMPANY_ERROR = 'nocompany';

/** Код ошибки инициализации «открыто не из сделки и не из компании» (лид и прочее). */
export const NO_ENTITY_ERROR = 'noentity';

/** Код ошибки инициализации «компания из placement не прочиталась». */
export const COMPANY_UNAVAILABLE_ERROR = 'companyunavailable';

/**
 * Boot-последовательность: Bitrix.start (во фрейме — реальный domain, вне
 * фрейма — TESTING_*) → [пользователь ∥ сессия портала → каталог ∥
 * placement → dealId → сделка+компания] → setAppData. Каталог стартует по
 * готовности сессии (portalSessionReady), остальное — на setAppData: портал,
 * слепок сделки, реквизиты, поставщики.
 *
 * Из карточки компании dealId — её открытая сделка «ОП Основная»; нет такой —
 * конструктор работает на компании без сделки (dealId и deal пустые), сделку
 * создаёт кнопка «Создать сделку».
 */
export const appInit = async (dispatch: AppDispatch) => {
    // deferUser: фрейм поднят — домен, placement и auth уже известны;
    // user.current идёт рядом, его ждёт только setAppData
    const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER, {
        deferUser: true,
    });
    const { domain: authDomain, inFrame } = bitrix.api.getInitializedData();

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
    const userReady = bitrix.api.whenUser();

    // Токен сессии портала нужен до первых запросов к бэку: каталог с ценами
    // отдаётся только ей. Сделке и компании из Bitrix REST он не нужен —
    // обмен идёт параллельно с ними (docs/first-load.tasks.md, шаги 3 и 4).
    // Как только токен выставлен, каталог стартует, не дожидаясь остального.
    // Вне фрейма сессии нет — dev ходит без токена.
    const sessionReady = bootstrapPortalSession(bitrix.api)
        .catch(() => false)
        .then(() => {
            dispatch(appActions.portalSessionReady({ domain }));
        });
    if (!inFrame) {
        console.info(`app-init: вне фрейма Bitrix — dev-режим (${domain})`);
    }

    const placement =
        bitrix.api.getPlacement() || (TESTING_PLACEMENT as Placement);
    const entity = resolvePlacementEntity(placement);

    // Конструктор открывается из сделки или компании; лид и прочие карточки —
    // отдельный экран, без падения.
    if (!entity) {
        dispatch(appActions.setInitializedError({ errorMessage: NO_ENTITY_ERROR }));
        return;
    }

    let dealId =
        entity.kind === 'deal'
            ? entity.id
            : await resolveCompanyDealId(entity.id, domain, sessionReady);

    // Сделка+компания из Bitrix REST — best-effort: в dev против чужого
    // портала REST может быть недоступен, init не должен падать.
    let deal: IBXDeal | null = null;
    let company: IBXCompany | null = null;
    if (dealId) {
        try {
            const bxResult = await bitrixInit(dealId);
            deal = bxResult?.deal ?? null;
            company = bxResult?.company ?? null;
        } catch (error) {
            console.warn('app-init: bitrix deal/company недоступны', error);
        }
    }

    if (entity.kind === 'company') {
        // сделка компании не прочиталась — работаем на самой компании
        if (!deal) dealId = null;
        company = company ?? (await readCompany(entity.id));
        // Компания — основа конструктора: без неё нет ни реквизитов, ни документов.
        if (!company) {
            dispatch(
                appActions.setInitializedError({
                    errorMessage: COMPANY_UNAVAILABLE_ERROR,
                }),
            );
            return;
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

    // после setAppData уходят запросы к бэку — токен должен быть уже выставлен;
    // пользователь нужен самому setAppData
    const [authUser] = await Promise.all([userReady, sessionReady]);
    const user = authUser ?? TESTING_USER;

    dispatch(
        appActions.setAppData({
            domain,
            user,
            deal,
            company,
            dealId,
            placement: { code: placement.placement, entity: entity.kind },
        }),
    );
};
