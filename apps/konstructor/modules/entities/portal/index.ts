export type { Portal, PBXSmart, PBX_SMART_TYPE } from './type/portal.type';
export {
    getComplectVariantPbxSmart,
    getComplectVariantPbxSmartEntityId,
} from './lib/portal-util';

export { portalReducer, portalSlice, resetPortal, setPortal } from './model/PortalSlice';
export type { PortalState } from './model/PortalSlice';

export { initPortal } from './model/PortalThunk';
export type { InitPortalArgs } from './model/PortalThunk';
