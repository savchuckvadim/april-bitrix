export { portalAPI, portalReducer, portalActions } from './entities/portal';
// Резолвер полей слепка (§7.2 доктрины): единственное место сборки UF_CRM_*.
export {
    findPortalField,
    ufKey,
    findUfKey,
    readFieldValue,
    findFieldItemByCode,
    findFieldItemByBitrixId,
} from './lib/resolve';
export {
    getSalesTaskGroupId,
    getServiceTaskGroupId,
    getServiceSignalTaskGroupId,
} from './entities/portal/lib/portal-util';
export type {
    Portal,
    PBX_GROUP,
    PBXTasksGroup,
    PBXDeal,
    PBXList,
    PBXCompany,
    PBXLead,
    PBXDepartament,
    PBXField,
    PBXFieldItem,
    PBXCategory,
    PBXStage,
} from './entities/portal';
