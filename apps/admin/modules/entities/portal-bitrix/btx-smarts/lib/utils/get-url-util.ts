import { BTX_SMARTS_PATH } from "../../constantas/btx-smarts.consts";

const getBaseSmartsUrl = (portalId?: number) => {
    return portalId
        ? `/portal/${portalId}/${BTX_SMARTS_PATH}`
        : BTX_SMARTS_PATH;
};

export const getUrlToNewSmart = (portalId?: number) => {
    return `${getBaseSmartsUrl(portalId)}/new`;
};

export const getUrlToEditSmart = (portalId?: number, smartId?: number) => {
    return `${getBaseSmartsUrl(portalId)}/${smartId}/edit`;
};

export const getUrlToSmart = (portalId?: number, smartId?: number) => {
    return `${getBaseSmartsUrl(portalId)}/${smartId}`;
};

export const getUrlToSmarts = (portalId?: number) => {
    return getBaseSmartsUrl(portalId);
};
