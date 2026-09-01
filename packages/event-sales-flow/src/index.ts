/**
 * Фасад пакета (сборка А1c): версия, порты, типы, DTO, чистые модели и
 * билдеры ядра event-report-flow; исполнитель отчёта (А2) —
 * use-cases/execute-event-report.use-case.
 *
 * adapters/browser отсюда НЕ реэкспортируются намеренно: фронт импортирует
 * браузерные адаптеры лениво отдельным путём, а бэк подключит свои —
 * фасад ядра обязан оставаться изоморфным.
 */
export * from './version';

// --- Исполнитель отчёта (А2): порт бэкового event-report.use-case минус
// серверное; deferred[] вместо постановки сайд-очередей ---
export * from './use-cases/execute-event-report.use-case';

// --- Порты (швы) и настройки ---
export * from './ports/flow-transport.port';
export * from './ports/flow-portal.port';
export * from './ports/flow-logger.port';
export * from './ports/flow-settings';

// --- Типы event-report (зеркало back/.../event-report/types + доноры libs) ---
export * from './types/report-types';
export * from './types/presentation-types';
export * from './types/plan-types';
export * from './types/task-types';
export * from './types/event-report.event-codes';
export * from './types/bitrix-entities.type';
export * from './types/pbx-sales-event-field.type';
export * from './types/pbx-deal-sales-base-stages.const';
export * from './types/pbx-deal-sales-xo.type';
export * from './types/pbx-deal-sales-presentation.type';
export * from './types/pbx-deal-sales-tmc.type';
export * from './types/portal-deal.type';

// --- DTO контракта флоу (интерфейсные зеркала бэковых классов) ---
export * from './dto/event-sale-flow/event-sales-flow.dto';
export * from './dto/event-sale-flow/contact.dto';
export * from './dto/event-sale-flow/department.dto';
export * from './dto/event-sale-flow/fail.dto';
export * from './dto/event-sale-flow/flow-context.dto';
export * from './dto/event-sale-flow/lead.dto';
export * from './dto/event-sale-flow/open-task.dto';
export * from './dto/event-sale-flow/placement.dto';
export * from './dto/event-sale-flow/plan.dto';
export * from './dto/event-sale-flow/presentation.dto';
export * from './dto/event-sale-flow/questionnaire-answer.dto';
export * from './dto/event-sale-flow/report.dto';
export * from './dto/event-sale-flow/sale.dto';
export * from './dto/event-sale-flow/task.dto';
export * from './dto/event-sale-flow/user.dto';

// --- Чистое ядро: контекст, entity, deal ---
export * from './services/context/event-report.context';
export * from './services/init/event-report-init.types';
// Фасад init (раскол А2): класс с бэковой сигнатурой loadContext +
// buildDealListSelect; постановка чтений и пост-flush сборка — поимённо
// (для прямого пути А4), микро-хелперы резолва наружу не выносятся.
export * from './services/init/event-report-init.service';
export {
    fetchOwnerDeal,
    queueActiveDealsLoad,
    queueInitReads,
} from './services/init/load-context.query';
export {
    flattenResults,
    resolveInitContext,
    type IEventReportInitReadPlan,
} from './services/init/resolve-context';
export * from './services/entity/event-report-entity-fields.model';
export * from './services/entity/event-report-company-backfill.model';
export * from './services/entity/event-report-entity-flow.service';
export * from './services/entity/field-policy';
export * from './services/deal/deal-target-stage.calculator';
export * from './services/deal/deal-move-count.service';
export * from './services/deal/event-report-deal-flow.service';
export * from './services/deal/sales-base-deal.service';
export * from './services/deal/sales-presentation-deal.service';
export * from './services/deal/sales-xo-deal.service';
export * from './services/deal/tmc-deal.service';

// --- Чистое ядро: KPI, история, лид, задача ---
export * from './services/kpi-list/event-report-kpi-payload.builder';
export * from './services/history/event-history-comment.builder';
export * from './services/lead/lead-target-status.resolver';
export * from './services/task/event-task-description.builder';
export * from './services/task/event-task-checklist.catalog';

// --- I/O-сервисы флоу (А2): логика бэка 1:1, порты вместо
// BitrixService/PortalModel; прямые вызовы — через call-домен порта ---
export * from './services/task/event-report-task-flow.service';
export * from './services/kpi-list/event-report-kpi-flow.service';
export * from './services/lead/event-report-lead-relation.service';
export * from './services/lead/event-report-lead-request-sync.service';
export * from './services/post-fail/event-report-post-fail.service';
export * from './services/return-to-tmc/event-report-return-to-tmc.service';
export * from './services/history/event-report-entity-history.service';

// --- Чистое ядро: side-flow джобы (ЗПР / Презентации) ---
// Явный список: модульный экземпляр `logger` (внутренняя проводка зеркала)
// на поверхность пакета не выносится.
export {
    type SideFlowJobBase,
    buildSideFlowJobBase,
    buildSmartAnswers,
    coveredAnswerPurposes,
    parseCreatedDealId,
    sideJobId,
    warnOrphanAnswers,
    type QuestionnaireSmartContext,
    type SideFlowJobBuildInput,
    type SideFlowJobKind,
} from './services/post-flow/side-flow-job.base';
export * from './services/post-flow/zpr-flow-job.builder';
export * from './services/post-flow/presentation-flow-job.builder';
// Чистые типы раздела side-flow (SmartKpiRowRef и т.п.) — адреса строк
// KPI/History в джобах; сами сервисы раздела серверные (А2).
export * from './shared/side-flow';
export * from './zpr-flow/dto/zpr-flow-job.dto';
export * from './zpr-flow/lib/zpr-survey-snapshot';
export * from './presentation-flow/dto/presentation-flow-job.dto';
export * from './presentation-flow/lib/presentation-outcome';
// Анкета «5К/Хвост»: коды-whitelist, нормализация ответов и КАНОНИЧЕСКИЙ
// текст вопросов. Текст нужен фронту, чтобы открыть поле шаблоном, и бэку,
// чтобы отличить нетронутый шаблон от ответа — копия на фронте разъехалась
// бы на первой правке формулировки.
export * from './shared/presentation-survey';
export * from './presentation-flow/lib/presentation-survey-snapshot';
export * from './sales-hooks/duplicate-check/lib/duplicate-timeline.formatter';

// --- Shared: дата-библиотека, логгер, батч, битрикс-типы ---
export * from './shared/lib/date';
export * from './shared/lib/logger';
export * from './shared/lib/pbx-field-type.util';
export * from './shared/utils/date-convert.util';
export * from './shared/batch/batch-text';
export * from './shared/batch/batch-group-buffer';
export * from './shared/batch/batch-group-buffer.interface';
// bitrix.interface экспортируется поимённо БЕЗ IBXLead: публичный IBXLead
// пакета — богатый (bx-lead.interface, его видят context/init, как на
// бэке через баррель '@/modules/bitrix'); минимальный остаётся внутренним
// для lead.dto, который импортирует его прямым путём — тоже как на бэке.
export {
    EBXTaskMark,
    EBXTaskStatus,
    ETaskPriority,
    type IBXCompany,
    type IBXContact,
    type IBXDeal,
    type IBXPlacement,
    type IBXPlacementOptions,
    type IBXTask,
    type IBXUser,
} from './shared/bitrix/bitrix.interface';
export * from './shared/bitrix/checklist-item.interface';
export * from './shared/bitrix/list-item.interface';
// Разбор ответа батча (findBatchResult/prepareBatchResults) — зеркало
// app-шареда бэка; на нём стоит чтение addedTaskId исполнителем.
export * from './shared/bitrix/prepare-batch-results.util';

// --- Shared: портальные каталоги и доменные типы ---
export * from './shared/event-title/types/cold-work-kind';
export * from './shared/pbx-lead-request/type/pbx-lead-request.enum';
export * from './shared/pbx-sales-kpi-list/type/pbx-sales-kpi-list-field.type';
export * from './shared/kpi-list-flow/type/kpi-event-payload.type';
export * from './shared/kpi-list-flow/models/kpi-event-item.model';
export * from './shared/kpi-list-flow/services/kpi-list-flow.service';
export * from './shared/lead-request/lead-request-history.util';
export * from './shared/portal-fields';
export * from './shared/tasks/task-crm-binding.util';
// Явный список: `EventTypeCode` реестра конфликтует с одноимённым алиасом
// types/event-report.event-codes (оба — честные зеркала РАЗНЫХ бэковых
// деклараций; при `export *` из обоих имя молча выпало бы с фасада).
// Фасад отдаёт event-report'овский; реестровый — прямым импортом модуля.
export {
    EVENT_TYPES_WITH_SMART,
    EVENT_TYPE_REGISTRY,
    EnumEventSmartFlow,
    findEventType,
    findEventTypesBySmartKind,
    findSmartBindingByTypeGroup,
    findSmartKindByFlow,
    type EventTypeDescriptor,
    type EventTypeSmartBinding,
} from './shared/event-type-registry/event-type-registry';
export * from './shared/const-smart-registry/const-smart-registry';
export * from './shared/questionnaires';
export * from './shared/questionnaire-answers';
export * from './shared/pbx-presentation-smart';
export * from './shared/pbx-zpr-smart';
export * from './shared/pbx-duplicate';
export * from './shared/smart-item-fields';
