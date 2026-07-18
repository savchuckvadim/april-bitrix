// Экспортируем DTO типы напрямую из @workspace/nest-admin-api
export type {
    AdminPortalResponseDto,
    CreatePortalDto,
    UpdatePortalDto,
    AdminPortalGetAllPortalsParams
} from './type/dto';
export * from './slice/PortalSlice';
export * from './thunk/curent-portal.thunk';