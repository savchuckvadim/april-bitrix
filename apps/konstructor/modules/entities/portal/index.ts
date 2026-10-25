export {
    PBX_DEAL_CATEGORY,
    PBX_RPA_SUPPLY,
    PBX_SMART_TYPE,
    type PBXCategory,
    type PBXDeal,
    type PBXField,
    type PBXFieldItem,
    type PBXRPA,
    type PBXSmart,
    type Portal,
} from './model/dto';
export {
    getComplectVariantPbxSmart,
    getComplectVariantPbxSmartEntityId,
    getIsServiceDepartment,
    getRpaFieldId,
    getRpaSupplyTypeId,
    getSalesCategoryId,
    getServiceCategoryId,
    getServiceOfferPbxSmart,
    getServiceOfferPbxSmartEntityId,
} from './lib/portal-util';
export { portalReducer, portalSlice, resetPortal, setPortal } from './model/PortalSlice';
export type { PortalState } from './model/PortalSlice';
export { initPortal } from './model/PortalThunk';
export type { InitPortalArgs } from './model/PortalThunk';
export { usePortal } from './hooks/portal.hooks';
