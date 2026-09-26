import type {
    AiAbsenceDto,
    AiAbsenceDtoKind,
    AiAboutDto,
    AiAboutEstimandDto,
    AiAboutEstimandDtoKind,
    AiAboutEstimateDto,
    AiAboutEstimateDtoSource,
    AiAboutModelDto,
    AiAboutParamDto,
    AiAboutParamDtoKind,
    AiAboutParamDtoLayer,
    AiAboutParamDtoReason,
    AiAboutParamDtoValue,
    AiAboutRequestDtoEndpoint,
    AiAboutSanityDto,
    AiAboutSanityDtoDataQuality,
    AiAgendaDisagreementDto,
    AiAgendaDto,
    AiAgendaItemDto,
    AiAgendaItemDtoKind,
    AiAnalyticsSettingsDto,
    AiCallReportStatusDto,
    AiAttentionBasisDto,
    AiBetaCountdownDto,
    AiBriefBulletDto,
    AiBriefDto,
    AiBriefDtoSource,
    AiBriefDtoTone,
    AiBriefUsageDto,
    AiDailyPlanDto,
    AiDailyPlanDtoReason,
    AiDailyPlanExplanationDto,
    AiDailyPlanItemDto,
    AiDailyPlanItemDtoCallType,
    AiDailyPlanRopOnlyDto,
    AiDailyPlanRopOnlyDtoBetaSource,
    AiDailyPlanRopOnlyDtoBindingConstraint,
    AiDailyPlanRopOnlyDtoUnreachable,
    AiDailyPlanStepDto,
    AiDailyPlanStepDtoCode,
    AiDailyPlanTargetDto,
    AiDailyPlanTargetDtoSource,
    AiDailyPlanTargetDtoWarningsItem,
    AiRopMarkCallDto,
    AiRopMarkCallDtoReason,
    AiRopMarkDto,
    AiRopMarkDtoSectionsItem,
    AiRopMarkSaveRequestDto,
    AiRopMarkSaveResultDto,
    AiRopMarkWeekDto,
    AiStyleAxisDto,
    AiStyleCardDto,
    AiStyleCardDtoStatus,
    AiStyleProfileDto,
    AiStyleTagDto,
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
    AiLevelTargetDto,
    AiManagerAbsencesDto,
    AiManagerLevelDto,
    AiManagerLevelDtoLevel,
    AiManagerRowDto,
    AiManagerRowDtoFunnelShape,
    AiManagerRowDtoLevelSource,
    AiManagerRowDtoSinceSource,
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
    AiSettingsSaveRequestDto,
    AiSettingsSaveResultDto,
    AiTargetOverrideDto,
    AiTargetsDto,
    AiTypeTotalsDto,
    MetricConfidenceDtoLevel,
    MetricDto,
    ReadinessDto,
    ReadinessDtoBetaCountdown,
    ReadinessDtoBetaSource,
    ReadinessDtoMode,
    AiAboutReliabilityCategoryDto,
    AiAboutReliabilityDto,
    AiAboutSigmaLlmDto,
    AiAboutSigmaLlmDtoSource,
    AiDossierDto,
    AiDossierFeedbackSummaryDto,
    AiDossierMetaDto,
    AiDossierPassportDto,
    AiDossierReasonDto,
    AiDossierRopMarksDto,
    AiDossierSeriesDto,
    AiDossierSeriesPointDto,
    AiGoodhartFlagDto,
    AiManagerTrendsDto,
    AiPlanFactDto,
    AiPlanFactDtoReasonsItem,
    AiPlanFactManagerDto,
    AiPlanFactPeriodDto,
    AiPlanFactRowDto,
    AiPlanFactRowDtoIndicator,
    AiPlanFactRowDtoStatus,
    AiTrendSignalDto,
    AiTrendSignalDtoKind,
    AiYoyDto,
    AiYoyMetricDto,
    AiYoyMetricDtoMetric,
    ReadinessDtoSigmaLlmSource,
} from '@workspace/nest-kpi-report-sales-api';

/**
 * Доменные алиасы generated DTO AI-аналитики ОП. UI, thunks и listeners
 * работают только с ними — переименование на бэке затронет один файл.
 */
export type AiAnalyticsSettings = AiAnalyticsSettingsDto;
/**
 * Конвейер разбора звонков портала (settings/get.callReport): включён ли,
 * пилотный список сотрудников (непустой — разборы только у них; null —
 * весь отдел продаж), только ОП, порог длительности. Поля нет в settings —
 * статус не прочитан (не путать с «выключено»).
 */
export type AiCallReportStatus = AiCallReportStatusDto;
export type AiReadiness = ReadinessDto;
export type AiReadinessMode = ReadinessDtoMode;
/** Связь «качество → исход»: none | hypothesis | data (гейт β пройден). */
export type AiReadinessBetaSource = ReadinessDtoBetaSource;
/** Счётчик «до оценки β»; null — гейт пройден / kpi-only / считать не из чего. */
export type AiReadinessBetaCountdown = ReadinessDtoBetaCountdown;
export type AiBetaCountdown = AiBetaCountdownDto;
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
/** Источник уровня: manual — РОП; passport — по стажу из дат Bitrix (ночной паспорт); default — ни того, ни другого. */
export type AiManagerLevelSource = AiManagerRowDtoLevelSource;
/** Откуда дата стажа: manual | employment (дата приёма) | register (регистрация в Bitrix) | proxy (первое событие). */
export type AiManagerSinceSource = AiManagerRowDtoSinceSource;
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

/* ---------- Настройки витрины (settings/save) ---------- */

export type AiManagerLevelInput = AiManagerLevelDto;
export type AiSettingsSaveResult = AiSettingsSaveResultDto;
/**
 * Цель уровня: продажи в месяц, минимум презентаций, холодных в день.
 * sales = null — цели уровня нет: цель месяца берётся из плана
 * руководителя или личной цели, а без них план дня получает оговорку
 * target-empty («цель не задана»): медиану полосы бэк не подставляет.
 */
export type AiLevelTargetInput = AiLevelTargetDto;
export type AiTargetOverrideInput = AiTargetOverrideDto;
export type AiTargetsInput = AiTargetsDto;
/** Вид отсутствия: vacation | sick | training | other. */
export type AiAbsenceKind = AiAbsenceDtoKind;
export type AiAbsenceInput = AiAbsenceDto;
export type AiManagerAbsencesInput = AiManagerAbsencesDto;
/**
 * Тело settings/save без requester'а. Каждый блок необязателен: передан —
 * перезаписывается целиком, не передан — на сервере остаётся прежним.
 */
export type AiSettingsInput = Omit<
    AiSettingsSaveRequestDto,
    'domain' | 'requesterUserId'
>;
/** Имя блока настроек (levels | targets | absences | … | rosterConfirmedAt). */
export type AiSettingsBlockName = keyof AiSettingsInput;

/* ---------- План дня менеджера (Фаза 2, plan/daily) ---------- */

export type AiDailyPlan = AiDailyPlanDto;
/** Штатная деградация плана: portal-model-missing | forecast-missing | manager-month-missing; null — полные данные. */
export type AiDailyPlanReason = AiDailyPlanDtoReason;
export type AiDailyPlanItem = AiDailyPlanItemDto;
/** Ребро воронки строки плана (call_to_presentation, …). */
export type AiDailyPlanItemCallType = AiDailyPlanItemDtoCallType;
export type AiDailyPlanTarget = AiDailyPlanTargetDto;
export type AiDailyPlanTargetSource = AiDailyPlanTargetDtoSource;
export type AiDailyPlanTargetWarning = AiDailyPlanTargetDtoWarningsItem;
export type AiDailyPlanExplanation = AiDailyPlanExplanationDto;
export type AiDailyPlanStep = AiDailyPlanStepDto;
export type AiDailyPlanStepCode = AiDailyPlanStepDtoCode;
/** Служебный блок руководителя; менеджеру не отдаётся. */
export type AiDailyPlanRopOnly = AiDailyPlanRopOnlyDto;
export type AiDailyPlanBetaSource = AiDailyPlanRopOnlyDtoBetaSource;
export type AiDailyPlanBindingConstraint =
    AiDailyPlanRopOnlyDtoBindingConstraint;
export type AiDailyPlanUnreachable = AiDailyPlanRopOnlyDtoUnreachable;

/** Запрос плана дня: чей план и на какой день (без даты — сегодня в TZ портала). */
export interface AiDailyPlanQuery {
    managerId: string;
    date?: string;
}

/* ---------- AI-резюме периода (brief, очередь + WS) ---------- */

export type AiBrief = AiBriefDto;
export type AiBriefBullet = AiBriefBulletDto;
/** Тон резюме: calm | attention | alarm. */
export type AiBriefTone = AiBriefDtoTone;
/** llm — ответ модели прошёл факт-чек; template — шаблон по фактам (см. reason). */
export type AiBriefSource = AiBriefDtoSource;
export type AiBriefUsage = AiBriefUsageDto;

/* ---------- Слепая оценка руководителя (rop-mark) ---------- */

export type AiRopMarkWeek = AiRopMarkWeekDto;
export type AiRopMarkCall = AiRopMarkCallDto;
/** Почему звонок в подборе: uncertain_type | best_score | random. */
export type AiRopMarkCallReason = AiRopMarkCallDtoReason;
export type AiRopMark = AiRopMarkDto;
/** Раздел рубрики метки (GREETING … REFUSAL). */
export type AiRopMarkSection = AiRopMarkDtoSectionsItem;
export type AiRopMarkSaveResult = AiRopMarkSaveResultDto;

/** Неделя проверки: ключ ISO-недели YYYY-Www либо любой её день; пусто — текущая неделя портала. */
export interface AiRopMarkWeekQuery {
    weekKey?: string;
    date?: string;
}

/** Метка руководителя по звонку подбора (тело rop-mark/save без requester'а). */
export type AiRopMarkInput = Omit<
    AiRopMarkSaveRequestDto,
    'domain' | 'requesterUserId'
>;

/* ---------- Карточка стиля менеджера (manager/style) ---------- */

export type AiStyleCard = AiStyleCardDto;
/** ready — профиль есть; few_data — данных мало; opt_out — сотрудник отказался. */
export type AiStyleCardStatus = AiStyleCardDtoStatus;
export type AiStyleProfile = AiStyleProfileDto;
export type AiStyleAxis = AiStyleAxisDto;
export type AiStyleTag = AiStyleTagDto;

/** Запрос карточки стиля: менеджер и месяц окна YYYY-MM (без месяца — последний профиль). */
export interface AiStyleQuery {
    managerId: string;
    month?: string;
}

/* ---------- Блок «Как считаем» (about) ---------- */

export type AiAbout = AiAboutDto;
/** Ручка витрины, для которой нужен блок: overview | plan/daily | brief | manager/style. */
export type AiAboutEndpoint = AiAboutRequestDtoEndpoint;
export type AiAboutParam = AiAboutParamDto;
export type AiAboutParamValue = AiAboutParamDtoValue;
export type AiAboutParamLayer = AiAboutParamDtoLayer;
export type AiAboutParamKind = AiAboutParamDtoKind;
export type AiAboutParamReason = AiAboutParamDtoReason;
export type AiAboutModel = AiAboutModelDto;
export type AiAboutEstimate = AiAboutEstimateDto;
export type AiAboutEstimateSource = AiAboutEstimateDtoSource;
export type AiAboutEstimand = AiAboutEstimandDto;
export type AiAboutEstimandKind = AiAboutEstimandDtoKind;
export type AiAboutSanity = AiAboutSanityDto;
export type AiAboutDataQuality = AiAboutSanityDtoDataQuality;

/** Статус конверта ответа (одинаков у всех ручек модуля). */
export type AiEnvelopeStatus = AiPulseResponseDtoStatus;
export type AiCacheResetScope = AiCacheResetRequestDtoScope;

/* ---------- Фаза 3: тренды, план-факт, год назад, досье, надёжность ---------- */

/** Блок трендов строки менеджера (ai-analytics-trends): сигналы и флаги Гудхарта. */
export type AiManagerTrends = AiManagerTrendsDto;
export type AiTrendSignal = AiTrendSignalDto;
/** Вид сигнала: shift — сдвиг уровня, drift — дрейф, outlier — выброс. */
export type AiTrendSignalKind = AiTrendSignalDtoKind;
/** Флаг детектора Гудхарта: давление выросло, противовес упал. */
export type AiGoodhartFlag = AiGoodhartFlagDto;

export type AiPlanFact = AiPlanFactDto;
export type AiPlanFactManager = AiPlanFactManagerDto;
export type AiPlanFactPeriod = AiPlanFactPeriodDto;
export type AiPlanFactRow = AiPlanFactRowDto;
/** Показатель строки план-факта: sales | calls | presentations. */
export type AiPlanFactIndicator = AiPlanFactRowDtoIndicator;
/** Статус строки: on-track | behind | ahead | no-plan. */
export type AiPlanFactRowStatus = AiPlanFactRowDtoStatus;
/** Причина пустых чисел план-факта: plan-snapshot-missing | manager-month-missing | daily-plan-disabled. */
export type AiPlanFactReason = AiPlanFactDtoReasonsItem;

/** Запрос план-факта: месяц YYYY-MM и (руководителю) менеджеры; пусто — весь периметр. */
export interface AiPlanFactQuery {
    monthKey: string;
    managerIds?: string[];
}

export type AiYoy = AiYoyDto;
export type AiYoyMetric = AiYoyMetricDto;
/** Величина сравнения: quality | analyzed_calls | sales_count | sales_sum | average_check. */
export type AiYoyMetricCode = AiYoyMetricDtoMetric;

export type AiDossier = AiDossierDto;
export type AiDossierPassport = AiDossierPassportDto;
export type AiDossierSeries = AiDossierSeriesDto;
export type AiDossierSeriesPoint = AiDossierSeriesPointDto;
export type AiDossierFeedbackSummary = AiDossierFeedbackSummaryDto;
export type AiDossierRopMarks = AiDossierRopMarksDto;
export type AiDossierReason = AiDossierReasonDto;
export type AiDossierMeta = AiDossierMetaDto;

/** Запрос досье: менеджер и окно в месяцах (1..12, по умолчанию 3). */
export interface AiDossierQuery {
    managerId: string;
    months: number;
}

/** Секция «надёжность оценщика» блока «Как считаем» (test-retest). */
export type AiAboutReliability = AiAboutReliabilityDto;
export type AiAboutReliabilityCategory = AiAboutReliabilityCategoryDto;
export type AiAboutSigmaLlm = AiAboutSigmaLlmDto;
/** measured — σ_llm измерена на парах, configured — дефолт реестра. */
export type AiAboutSigmaSource = AiAboutSigmaLlmDtoSource;
export type AiReadinessSigmaSource = ReadinessDtoSigmaLlmSource;

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
