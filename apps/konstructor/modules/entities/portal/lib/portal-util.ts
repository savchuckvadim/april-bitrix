import type { IBXDeal } from '@bitrix/domain';

import type { PBXCategory, PBXRPA, PBXSmart, Portal } from '../type/portal.type';

export const getRpaSupplyTypeId = (portal: Portal): number | null => {
    const rpas = portal.rpas;
    let supplyRPA: PBXRPA | undefined;
    if (rpas && rpas.length) {
        supplyRPA = rpas.find(rpa => rpa.code === 'supply');
    }
    if (supplyRPA) {
        return supplyRPA.bitrixId;
    }
    return null;
};

export const getSalesCategoryeId = (portal: Portal): number | null => {
    const deals = portal.bitrixDeal.categories as PBXCategory[];
    let categoryId = null;
    if (deals && deals.length) {
        const category = deals.find(category => category.code === 'sales_base');
        if (category) {
            categoryId = category.bitrixId;
        }
    }

    return categoryId;
};

export const getServiceCategoryeId = (portal: Portal): number | null => {
    const deals = portal.bitrixDeal.categories as PBXCategory[];
    let categoryId = null;
    if (deals && deals.length) {
        const category = deals.find(category => category.code === 'service_base');
        if (category) {
            categoryId = category.bitrixId;
        }
    }

    return categoryId;
};

export const getIsServiceDepartment = (portal: Portal | null, deal: IBXDeal | null): boolean => {
    let result = false;

    if (deal && deal.CATEGORY_ID) {
        if (portal) {
            const serviceCategoryId = getServiceCategoryeId(portal);

            if (serviceCategoryId && Number(serviceCategoryId) === Number(deal.CATEGORY_ID)) {
                result = true;
            }
        }
    }
    return result;
};

export const getServiceOfferPbxSmart = (portal: Portal): PBXSmart | null => {
    const smarts = portal.smarts;
    const serviceSmart = smarts.find(smart => smart.type === 'service_offer');
    if (serviceSmart) {
        return serviceSmart;
    }
    return null;
};
export const hasPortalServiceOfferPbxSmart = (portal: Portal): boolean => {
    const smarts = portal.smarts;
    const serviceSmart = smarts.find(smart => smart.type === 'service_offer');
    if (serviceSmart && serviceSmart.entityTypeId) {
        return true;
    }
    return false;
};

export const getServiceOfferPbxSmartEntityId = (portal: Portal): number | null => {
    const smarts = portal.smarts;
    const serviceSmart = smarts.find(smart => smart.type === 'service_offer');
    if (serviceSmart) {
        return serviceSmart.entityTypeId || null;
    }
    return null;
};

export const getRpaFieldId = (
    portal: Portal,
    rpaBxEntityTypeId: number,
    fieldCode: 'rpa_crm_base_deal' | 'service_offer_smart',
) => {
    const portalRpa = portal?.rpas.find(rpa => rpa.code === 'supply');
    const rpaFieldId =
        portalRpa?.bitrixfields.find(field => field.code === fieldCode)?.bitrixId || '';
    return `UF_RPA_${rpaBxEntityTypeId}_${rpaFieldId}`;
};
