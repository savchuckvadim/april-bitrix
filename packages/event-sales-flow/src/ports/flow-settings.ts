/**
 * Вход настроек флоу — ОТДЕЛЬНО от портов (это данные, а не швы).
 *
 * А0: каркас с заглушками-типами; наполнение выполнено исполнителем А2
 * (use-cases/execute-event-report.use-case): состав — ровно то, что бэковый
 * use-case читал сам (PortalAppSettingsService / LeadUfDefinitionsService),
 * а в пакете получает готовым значением. Источники значений: портальные
 * настройки приложения (storedKeys) и конфиг фронта; сборка — А3/А4.
 */

import type {
    EventFieldPolicySettings,
    EventStageRuleSettings,
} from '../services/entity/field-policy';
import type { LeadUfDefinitions } from '../shared/portal-fields';

/**
 * Настройки чек-листов задач (`withTaskChecklist` бэкового флоу):
 * гейт `task_checklist_enabled` портала, по умолчанию ВЫКЛ — как в бэковом
 * `isTaskChecklistEnabled` (недоступные настройки не включают чек-листы
 * неожиданно для владельца портала).
 */
export type WithTaskChecklist = boolean;

/**
 * Карта прав прямого исполнения (план А4): какие шаги пакет исполняет
 * напрямую из браузера, а какие уходят только досылкой (deferred).
 * ОТСУТСТВИЕ права ≡ запрету: дефолт каждого флага — false, и с пустой
 * картой всё гейтящееся уезжает в deferred[] (безопасный дефолт плана:
 * у менеджеров нет доступа к KPI-списку и воронкам «Презентации»/«ХО»,
 * роли смартов неизвестны).
 */
export interface DirectCapabilityMap {
    /**
     * НЕ ПОДДЕРЖАНО: прямого писателя смартов в пакете нет (element-writer’ы
     * ЗПР/«Презентации» серверные), side-flow уходит досылкой ВСЕГДА.
     * Допустимо только `false`/отсутствие; `true` — жёсткий отказ
     * `assertSupportedCapabilities` до первого обращения к Битриксу: имя
     * флага обещает работу, которой нет, и молча не делать обещанного
     * хуже, чем упасть. Флаг вернётся в строй вместе с реализацией.
     */
    allowSmartWrites?: false;
    /** KPI-список: записи и дедуп (`EventReportKpiFlowService.queue`). */
    allowKpiWrites?: boolean;
    /**
     * Движения сделок воронки «Презентации». Гейт в А2 грубый — deal-композит
     * целиком, см. комментарий в execute-event-report.use-case.
     */
    allowPresDealWrites?: boolean;
    /** Движения сделок воронки «ХО» (тот же грубый гейт композита). */
    allowXoDealWrites?: boolean;
    /** Волны синхронизации заявок/лидов ПОСЛЕ основного батча. */
    allowLeadRequestSync?: boolean;
    /** im-уведомление ответственному о переносе (`notifyTransfer`). */
    allowTransferNotify?: boolean;
    /** Задел будущих шагов: неизвестное право читается как false. */
    [capability: string]: boolean | undefined;
}

/**
 * Маркер анти-двойного исполнения прямого пути (доктрина плана А4):
 * ПЕРВОЙ командой пишущего батча уходит `task.commentitem.add` в задачу
 * события с текстом-тегом `[evflow:{operationId}]`. Прямой исполнитель
 * перед запуском читает комментарии этой задачи: тег найден — пишущий
 * батч этой операции уже отправлялся, повторное исполнение запрещено
 * (исход duplicate-marker).
 *
 * package-adapted: поле существует только у пакета — бэковый use-case
 * исполняется на бэке единожды (идемпотентность даёт operationId по
 * Redis-статусу) и маркера не пишет; поле не передано — команда не
 * ставится, состав батча бэковый.
 */
export interface DirectExecutionMarker {
    /** Задача события (`dto.currentTask.id`) — адресат комментария-тега. */
    taskId: number | string;
    /** Полный текст комментария; обязан содержать `[evflow:{operationId}]`. */
    text: string;
    /** Автор комментария — менеджер конверта (envelope.userId). */
    authorId: number;
}

/** Совокупный вход настроек флоу. */
export interface FlowSettings {
    withTaskChecklist?: WithTaskChecklist;
    /**
     * Классы поведения полей карточки — итог бэкового
     * `resolveFieldPolicySettings` (Boolean-коэрция портальных
     * `withCalculatedNextEvent`/`withFinalFieldsReset` — забота сборщика
     * настроек). Отсутствует → дефолты СХЕМЫ
     * (`DEFAULT_FIELD_POLICY_SETTINGS`) — ровно бэковая ветка «настройки
     * недоступны — работаем на дефолтах схемы, а не выключаем расчёт».
     */
    fieldPolicySettings?: EventFieldPolicySettings;
    /**
     * Правила стадий основной воронки — итог бэкового
     * `resolveStageRuleSettings` (Boolean-коэрция портального
     * `withRefineStageOnPlan`). Отсутствует → дефолт СХЕМЫ
     * (`DEFAULT_STAGE_RULE_SETTINGS`): исключение «Доработка всегда»
     * выключено — бэковая ветка «настройки недоступны».
     */
    stageRuleSettings?: EventStageRuleSettings;
    /**
     * Определения UF-полей-связей лида «как они есть на портале» — итог
     * бэкового `leadLinkDefinitions` (`LeadUfDefinitionsService.resolve`,
     * серверный кэш 10 мин). Нужны только lead-request-sync'у: от числа
     * разрешённых типов crm-поля зависит формат значения (`123` против
     * `D_123`). Отсутствуют → `{}` — сервис работает на безопасном
     * дефолте с префиксом (см. EventReportLeadRequestSyncService).
     */
    leadUfDefinitions?: LeadUfDefinitions;
    capabilities?: DirectCapabilityMap;
    directMarker?: DirectExecutionMarker;
}
