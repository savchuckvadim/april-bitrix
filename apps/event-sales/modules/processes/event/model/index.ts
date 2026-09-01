import type {
    EventFlowOperationDto,
    EventFlowOperationDtoResult,
    EventSalesFlowDto,
    PresentationSurveyAnswersDto,
} from '@workspace/nest-event-sales-api';
import { EventFlowOperationDtoStatus } from '@workspace/nest-event-sales-api';

// Ре-маппинг generated DTO → доменные алиасы (правило CLAUDE.md).
export type EvFlowDto = EventSalesFlowDto;

/**
 * Блок `presentation.survey` контракта: ответы опросника «5К»/«Хвост»,
 * едущие ВМЕСТЕ с отчётом. Форма — сгенерированная бэком, чтобы
 * переименование поля на бэке ловилось типами, а не в проде.
 */
export type EvPresentationSurvey = PresentationSurveyAnswersDto;

/** Операция отправки отчёта: бэкенд отвечает ей сразу, до выполнения flow. */
export type EvFlowOperation = EventFlowOperationDto;
export type EvFlowResult = EventFlowOperationDtoResult;

export const EV_FLOW_OPERATION_STATUS = EventFlowOperationDtoStatus;
export type EvFlowOperationStatus = EventFlowOperationDtoStatus;
