import type {
    CompanyDealsRequestDto,
    CompanyDealsResponseDto,
    NewTaskInitRequestDto,
    NewTaskInitResponseDto,
} from '@workspace/nest-event-sales-api';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md):
// UI/хуки/thunks используют только эти имена — переименование на бэке
// трогает только этот файл.
export type EvSaleCompanyDealsDto = CompanyDealsRequestDto;
export type EvSaleCompanyDealsResponse = CompanyDealsResponseDto;
export type EvSaleNewTaskInitDto = NewTaskInitRequestDto;
export type EvSaleNewTaskInitResponse = NewTaskInitResponseDto;
