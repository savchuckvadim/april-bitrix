export type { Portal } from './type/portal.type';

export { portalReducer, portalSlice, resetPortal, setPortal } from './model/PortalSlice';
export type { PortalState } from './model/PortalSlice';

export { initPortal } from './model/PortalThunk';
export type { InitPortalArgs } from './model/PortalThunk';
