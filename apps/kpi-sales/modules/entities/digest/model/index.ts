import type {
    BXUserDto,
    KpiDigestCallsDto,
    KpiDigestCatalogDto,
    KpiDigestCatalogItemDto,
    KpiDigestCatalogItemDtoGroup,
    KpiDigestCountDto,
    KpiDigestCountersDto,
    KpiDigestDirectionDto,
    KpiDigestEmployeeDto,
    KpiDigestFiltersDto,
    KpiDigestFiltersDtoKind,
    KpiDigestHourDto,
    KpiDigestRecordDto,
    KpiDigestReportDto,
    KpiDigestRequestDto,
    KpiDigestResponseDto,
    KpiDigestResponseDtoStatus,
    KpiDigestSummaryDto,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Доменные алиасы generated DTO дневного дайджеста
 * (back/apps/kpi-report-sales/src/digest/dto) — бэк-переименования
 * локализуются здесь, UI и хуки импортируют только эти имена.
 */

export type DigestPeriodKind = KpiDigestFiltersDtoKind;
export type DigestResponseStatus = KpiDigestResponseDtoStatus;
export type DigestTypeGroup = KpiDigestCatalogItemDtoGroup;
export type DigestBXUser = BXUserDto;

/** Счётчик с разбивкой по типам событий (код item'а → количество). */
export type DigestCount = KpiDigestCountDto;

/** Одна запись списка sales_kpi в компактном виде (событие менеджера). */
export type DigestRecord = KpiDigestRecordDto;

export type DigestHour = KpiDigestHourDto;
export type DigestDirection = KpiDigestDirectionDto;

/** Фактические звонки сотрудника за день (voximplant). */
export type DigestCalls = KpiDigestCallsDto;

/** Счётчики дня по событиям списка. */
export type DigestCounters = KpiDigestCountersDto;

export type DigestEmployee = KpiDigestEmployeeDto;

/** Сводка по всем ответственным портала (база «Ø все»). */
export type DigestSummary = KpiDigestSummaryDto;

export type DigestCatalogItem = KpiDigestCatalogItemDto;
export type DigestCatalog = KpiDigestCatalogDto;
export type DigestReport = KpiDigestReportDto;
export type DigestFilters = KpiDigestFiltersDto;
export type DigestRequest = KpiDigestRequestDto;
export type DigestResponse = KpiDigestResponseDto;
