import type {
    AiAgendaDisagreementDto,
    AiAgendaDto,
    AiAgendaItemDto,
    AiAgendaItemDtoKind,
    AiAnalyticsSettingsDto,
    AiAttentionBasisDto,
    AiAttentionDto,
    AiAttentionItemDto,
    AiAttentionItemDtoSignal,
    AiAttentionLinkDto,
    AiBucketScoreDto,
    AiBucketScoreDtoBucket,
    AiByTypeDto,
    AiByTypeLongRowDto,
    AiByTypeLongRowDtoKind,
    AiByTypeRequestDtoCallType,
    AiByTypeRequestDtoLayout,
    AiByTypeWideRowDto,
    AiCacheResetRequestDtoScope,
    AiCallTypeDto,
    AiCallTypeDtoCode,
    AiCellChecklistsDto,
    AiCellExplanationDto,
    AiCellKpiDto,
    AiCellSectionDto,
    AiDisciplineDto,
    AiFeedbackItemDto,
    AiFeedbackListDto,
    AiFeedbackRequestDtoKind,
    AiFinanceTailDto,
    AiFunnelEdgeDto,
    AiManagerLevelDto,
    AiManagerLevelDtoLevel,
    AiManagerRowDto,
    AiManagerRowDtoFunnelShape,
    AiManagerRowDtoLevelSource,
    AiManagerTypeCellDto,
    AiObjectionCategoryDto,
    AiObjectionOutcomesDto,
    AiObjectionsDto,
    AiObjectionsManagerDto,
    AiOverviewDto,
    AiOverviewMetaDto,
    AiOverviewPeriodDto,
    AiPulseAlertDto,
    AiPulseAlertDtoKind,
    AiPulseDto,
    AiPulseManagerDto,
    AiPulseResponseDtoStatus,
    AiPulseXmrDto,
    AiPulseXmrDtoState,
    AiRiskCallDto,
    AiSettingsSaveResultDto,
    AiTypeTotalsDto,
    MetricConfidenceDtoLevel,
    MetricDto,
    ReadinessDto,
    ReadinessDtoMode,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Доменные алиасы generated DTO AI-аналитики ОП. UI, thunks и listeners
 * работают только с ними — переименование на бэке затронет один файл.
 */
export type AiAnalyticsSettings = AiAnalyticsSettingsDto;
export type AiReadiness = ReadinessDto;
export type AiReadinessMode = ReadinessDtoMode;
export type AiCallType = AiCallTypeDto;
export type AiCallTypeCode = AiCallTypeDtoCode;

export type AiPulse = AiPulseDto;
export type AiPulseManager = AiPulseManagerDto;
export type AiPulseAlert = AiPulseAlertDto;
export type AiPulseAlertKind = AiPulseAlertDtoKind;
export type AiPulseXmr = AiPulseXmrDto;
export type AiPulseXmrState = AiPulseXmrDtoState;

export type AiAgenda = AiAgendaDto;
export type AiAgendaItem = AiAgendaItemDto;
export type AiAgendaItemKind = AiAgendaItemDtoKind;
export type AiAgendaDisagreement = AiAgendaDisagreementDto;

export type AiFeedbackKind = AiFeedbackRequestDtoKind;
export type AiFeedbackItem = AiFeedbackItemDto;
export type AiFeedbackList = AiFeedbackListDto;

export type AiMetric = MetricDto;
export type AiMetricConfidenceLevel = MetricConfidenceDtoLevel;

/* ---------- Обзор менеджер × тип звонка (Фаза 1b) ---------- */

export type AiOverview = AiOverviewDto;
export type AiOverviewMeta = AiOverviewMetaDto;
export type AiOverviewPeriod = AiOverviewPeriodDto;
export type AiManagerRow = AiManagerRowDto;
/** Уровень менеджера (junior | middle | senior) — общий для строки и формы. */
export type AiManagerLevel = AiManagerLevelDtoLevel;
export type AiManagerLevelSource = AiManagerRowDtoLevelSource;
export type AiFunnelShape = AiManagerRowDtoFunnelShape;
export type AiBucketScore = AiBucketScoreDto;
export type AiBucket = AiBucketScoreDtoBucket;
export type AiManagerTypeCell = AiManagerTypeCellDto;
export type AiCellSection = AiCellSectionDto;
export type AiCellChecklists = AiCellChecklistsDto;
export type AiCellKpi = AiCellKpiDto;
export type AiCellExplanation = AiCellExplanationDto;
export type AiFunnelEdge = AiFunnelEdgeDto;
export type AiFinanceTail = AiFinanceTailDto;
export type AiDiscipline = AiDisciplineDto;
export type AiRiskCall = AiRiskCallDto;
export type AiTypeTotals = AiTypeTotalsDto;

/* ---------- «Внимание» ---------- */

export type AiAttention = AiAttentionDto;
export type AiAttentionItem = AiAttentionItemDto;
export type AiAttentionSignal = AiAttentionItemDtoSignal;
export type AiAttentionBasis = AiAttentionBasisDto;
export type AiAttentionLink = AiAttentionLinkDto;

/* ---------- Срез по типу / возражения ---------- */

export type AiByType = AiByTypeDto;
/** Код типа звонка подвкладки, all — все типы вместе, objections — срез возражений. */
export type AiByTypeCallType = AiByTypeRequestDtoCallType;
export type AiByTypeLayout = AiByTypeRequestDtoLayout;
export type AiByTypeWideRow = AiByTypeWideRowDto;
export type AiByTypeLongRow = AiByTypeLongRowDto;
export type AiByTypeLongRowKind = AiByTypeLongRowDtoKind;
export type AiObjections = AiObjectionsDto;
export type AiObjectionsManager = AiObjectionsManagerDto;
export type AiObjectionCategory = AiObjectionCategoryDto;
export type AiObjectionOutcomes = AiObjectionOutcomesDto;

/* ---------- Настройки уровней ---------- */

export type AiManagerLevelInput = AiManagerLevelDto;
export type AiSettingsSaveResult = AiSettingsSaveResultDto;

/** Статус конверта ответа (одинаков у всех ручек модуля). */
export type AiEnvelopeStatus = AiPulseResponseDtoStatus;
export type AiCacheResetScope = AiCacheResetRequestDtoScope;

/** Конверт ответа ручек AI-аналитики (ready|queued|processing|error). */
export interface AiEnvelope<T> {
    status: AiEnvelopeStatus;
    requestKey: string;
    jobId?: string;
    message?: string;
    data?: T;
}

/** Реакция пользователя на витрину (feedback). */
export interface AiFeedbackInput {
    kind: AiFeedbackKind;
    /** Объект реакции: pulse, agenda, call:<id>, attention:<id>:<signal>, overview:<id>. */
    object: string;
    managerId?: string;
    transcriptionId?: string;
    reason?: string;
}

/** Фильтры тяжёлых ручек обзора (период ≤ 3 мес., состав менеджеров). */
export interface AiOverviewFilters {
    from: string;
    to: string;
    managerIds?: number[];
    confirmedOnly?: boolean;
}

/** Служебные параметры тяжёлого запроса: WS-подписка и обход кэша. */
export interface AiQueueOptions {
    socketId?: string;
    forceRefresh?: boolean;
}
