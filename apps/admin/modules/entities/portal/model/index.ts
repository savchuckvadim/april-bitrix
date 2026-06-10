// Экспортируем DTO типы напрямую из @workspace/nest-api
export type {
    PortalResponseDto,
    CreatePortalDto,
    UpdatePortalDto,
    AdminPortalGetAllPortalsParams
} from './type/dto';
export * from './slice/PortalSlice';
export * from './thunk/curent-portal.thunk';
export * from './listener/portal-bitrix-client.listener';