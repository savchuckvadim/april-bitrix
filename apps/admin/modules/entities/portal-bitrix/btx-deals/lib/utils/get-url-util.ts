import { BTX_DEALS_PATH } from "../../constantas/btx-deals.consts";

const getBaseBtxDealsUrl = (portalId?: number) => {
    return portalId
        ? `/portal/${portalId}/${BTX_DEALS_PATH}`
        : BTX_DEALS_PATH;
};

export const getUrlToNewBtxDeal = (portalId?: number) => {
    return `${getBaseBtxDealsUrl(portalId)}/new`;
};

export const getUrlToEditBtxDeal = (portalId?: number, dealId?: number) => {
    return `${getBaseBtxDealsUrl(portalId)}/${dealId}/edit`;
};

export const getUrlToBtxDeal = (portalId?: number, dealId?: number) => {
    return `${getBaseBtxDealsUrl(portalId)}/${dealId}`;
};

export const getUrlToBtxDeals = (portalId?: number) => {
    return getBaseBtxDealsUrl(portalId);
};
