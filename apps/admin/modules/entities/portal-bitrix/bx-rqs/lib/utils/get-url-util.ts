import { BX_RQS_PATH } from "../../constantas/bx-rq.consts";

const getBaseBxRqsUrl = (portalId?: number) => {
    return portalId
        ? `/portal/${portalId}/${BX_RQS_PATH}`
        : BX_RQS_PATH;
};

export const getUrlToNewBxRq = (portalId?: number) => {
    return `${getBaseBxRqsUrl(portalId)}/new`;
};

export const getUrlToEditBxRq = (portalId?: number, rqId?: number) => {
    return `${getBaseBxRqsUrl(portalId)}/${rqId}/edit`;
};

export const getUrlToBxRq = (portalId?: number, rqId?: number) => {
    return `${getBaseBxRqsUrl(portalId)}/${rqId}`;
};

export const getUrlToBxRqs = (portalId?: number) => {
    return getBaseBxRqsUrl(portalId);
};
