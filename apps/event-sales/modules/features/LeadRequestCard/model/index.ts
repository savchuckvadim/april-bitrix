import type {
    LeadRequestAcceptResultDto,
    LeadRequestCardDto,
    LeadRequestItemDto,
    LeadRequestSaleReadinessDto,
    LeadRequestUpdateDto,
    LeadRequestUpdateResultDto,
} from '@workspace/nest-event-sales-api';
import {
    LeadRequestUpdateDtoNotCaTypeCode,
    LeadSiteStatusStateDtoCurrentCode,
} from '@workspace/nest-event-sales-api';

/**
 * Доменные алиасы generated-типов карточки заявки. Коды статусов/стадий
 * типизированы на бэке (pbx-lead-request enum) и доехали сюда литеральными
 * union'ами — magic strings исключены и на фронте.
 */
export type LeadRequestCard = LeadRequestCardDto;
export type LeadRequestAcceptResult = LeadRequestAcceptResultDto;
export type LeadRequestItem = LeadRequestItemDto;
export type LeadRequestUpdate = LeadRequestUpdateDto;
export type LeadRequestUpdateResult = LeadRequestUpdateResultDto;
export type LeadRequestSaleReadiness = LeadRequestSaleReadinessDto;

/** Типизированные коды «не ЦА» (runtime-объект orval). */
export const LEAD_NOT_CA_TYPE_CODE = LeadRequestUpdateDtoNotCaTypeCode;
export type LeadNotCaTypeCode =
    (typeof LeadRequestUpdateDtoNotCaTypeCode)[keyof typeof LeadRequestUpdateDtoNotCaTypeCode];

/** Типизированные коды статуса заявки (значение «Не ЦА» и др.). */
export const LEAD_SITE_STATUS_CODE = LeadSiteStatusStateDtoCurrentCode;
