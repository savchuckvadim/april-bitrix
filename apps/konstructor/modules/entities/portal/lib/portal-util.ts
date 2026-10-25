import type { IBXDeal } from '@bitrix/domain';
import {
    PBX_DEAL_CATEGORY,
    PBX_RPA_SUPPLY,
    PBX_SMART_TYPE,
    type PBXSmart,
    type Portal,
} from '../model/dto';

/** bitrixId категории приходит строкой («34») — наружу отдаём число. */
const toId = (raw: string | number | null | undefined): number | null => {
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const findDealCategoryId = (
    portal: Portal | null,
    code: string,
): number | null =>
    toId(
        portal?.bitrixDeal?.categories.find(category => category.code === code)
            ?.bitrixId,
    );

const findSmart = (portal: Portal | null, type: string): PBXSmart | null =>
    portal?.smarts.find(smart => smart.type === type) ?? null;

export const getRpaSupplyTypeId = (portal: Portal | null): number | null =>
    toId(portal?.rpas.find(rpa => rpa.code === PBX_RPA_SUPPLY)?.bitrixId);

export const getSalesCategoryId = (portal: Portal | null): number | null =>
    findDealCategoryId(portal, PBX_DEAL_CATEGORY.SALES);

export const getServiceCategoryId = (portal: Portal | null): number | null =>
    findDealCategoryId(portal, PBX_DEAL_CATEGORY.SERVICE);

/** Сделка в сервисной воронке — конструктор работает в режиме отдела сервиса. */
export const getIsServiceDepartment = (
    portal: Portal | null,
    deal: IBXDeal | null,
): boolean => {
    const serviceCategoryId = getServiceCategoryId(portal);
    const dealCategoryId = toId(deal?.CATEGORY_ID);
    return (
        serviceCategoryId !== null &&
        dealCategoryId !== null &&
        serviceCategoryId === dealCategoryId
    );
};

/** Смарт «Предложение на будущий период» (сервисный отдел). */
export const getServiceOfferPbxSmart = (portal: Portal | null): PBXSmart | null =>
    findSmart(portal, PBX_SMART_TYPE.SERVICE_OFFER);

export const getServiceOfferPbxSmartEntityId = (
    portal: Portal | null,
): number | null => getServiceOfferPbxSmart(portal)?.entityTypeId || null;

/**
 * Смарт «Варианты комплекта»: несколько собранных предложений внутри одной
 * сделки. Не установлен на портале — null, и конструктор работает как раньше.
 */
export const getComplectVariantPbxSmart = (portal: Portal | null): PBXSmart | null =>
    findSmart(portal, PBX_SMART_TYPE.COMPLECT_VARIANT);

export const getComplectVariantPbxSmartEntityId = (
    portal: Portal | null,
): number | null => getComplectVariantPbxSmart(portal)?.entityTypeId || null;

/** Полный ключ UF-поля RPA «Поставка» по коду поля (`UF_RPA_<typeId>_<fieldId>`). */
export const getRpaFieldId = (
    portal: Portal | null,
    rpaBxEntityTypeId: number,
    fieldCode: 'rpa_crm_base_deal' | 'service_offer_smart',
): string => {
    const rpa = portal?.rpas.find(item => item.code === PBX_RPA_SUPPLY);
    const fieldId =
        rpa?.bitrixfields.find(field => field.code === fieldCode)?.bitrixId ?? '';
    return `UF_RPA_${rpaBxEntityTypeId}_${fieldId}`;
};
