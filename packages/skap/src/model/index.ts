import type {
    SkapPortalLastRunDto,
    SkapPortalRunResponseDto,
    SkapPortalStatusResponseDto,
} from '@workspace/nest-event-service-api';

/*
 * Доменные алиасы поверх сгенерированных DTO (@workspace/nest-event-service-api):
 * UI и хуки импортируют только их — переименование на бэке трогает один файл.
 */
export type SkapImportStatus = SkapPortalStatusResponseDto;
export type SkapImportLastRun = SkapPortalLastRunDto;
export type SkapImportRunResult = SkapPortalRunResponseDto;
