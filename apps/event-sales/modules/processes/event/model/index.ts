import type {
    EventFlowOperationDto,
    EventFlowOperationDtoResult,
    EventSalesFlowDto,
} from '@workspace/nest-event-sales-api';
import { EventFlowOperationDtoStatus } from '@workspace/nest-event-sales-api';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md).
export type EvFlowDto = EventSalesFlowDto;

/** Операция отправки отчёта: бэкенд отвечает ей сразу, до выполнения flow. */
export type EvFlowOperation = EventFlowOperationDto;
export type EvFlowResult = EventFlowOperationDtoResult;

export const EV_FLOW_OPERATION_STATUS = EventFlowOperationDtoStatus;
export type EvFlowOperationStatus = EventFlowOperationDtoStatus;
