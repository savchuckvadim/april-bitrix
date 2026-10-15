/**
 * Контракт раздела «Хуки и автоматика» (бэк admin, `HooksAdminController`:
 * `libs/portal-lib/hooks/admin/dto/*`).
 *
 * Типы написаны руками и зеркалят DTO поле в поле: клиент
 * `@workspace/nest-admin-api` ещё не перегенерирован (orval требует
 * запущенный бэк). После `pnpm generate` в пакете они заменяются на
 * алиасы generated-типов (`HookCatalogItemDto`, `HookCatalogEntryDto`,
 * `PortalHookReadinessDto`, `PortalHooksReadinessResponseDto`,
 * `PortalHookOperationsResponseDto`, …) — имена полей совпадают.
 */

export type HookFamily = 'sales-hook' | 'cold-hook' | 'lead-request' | 'cron';
export type HookKind = 'webhook' | 'button' | 'cron' | 'internal';
export type HookPbxEntity = 'lead' | 'deal' | 'company' | 'contact' | 'task';
export type HookStageEntity = 'lead' | 'deal';
export type HookFieldRole = 'reads' | 'writes' | 'marker' | 'routing' | 'link';
export type HookSettingRole = 'gate' | 'param';
export type HookSettingType = 'boolean' | 'number' | 'string';
export type HookSettingValue = boolean | number | string;
export type HookEndpointKind = 'webhook' | 'run' | 'button' | 'status';
export type HookParamWhere = 'query' | 'body';
export type HookReadinessStatus = 'ready' | 'partial' | 'not-installed' | 'none';
export type HookOperationStatus = 'queued' | 'running' | 'done' | 'failed';

export interface HookCron {
    /** Имя крона в коде. */
    name: string;
    /** Расписание человеческим текстом. */
    schedule: string;
    /** Замечания: лок, лимиты за проход. */
    note: string | null;
}

export interface HookEndpoint {
    kind: HookEndpointKind;
    method: 'GET' | 'POST';
    /** Путь относительно корня API event-sales. */
    path: string;
    description: string;
    /** Готовый пример вызова одной строкой. */
    example: string | null;
}

export interface HookParam {
    name: string;
    where: HookParamWhere;
    values: string | null;
    default: string | null;
    required: boolean;
    description: string;
    /** Доступен только в /run (кнопка), роботу — нет. */
    runOnly: boolean;
}

export interface HookSettingRef {
    /** Код приложения настроек (event-sales, …). */
    app: string;
    /** camelCase-ключ схемы настроек. */
    key: string;
    /** snake_case-код настройки (как в админке). */
    code: string;
    name: string;
    type: HookSettingType;
    default: HookSettingValue;
    /** gate — рубильник, param — параметр. */
    role: HookSettingRole;
    /** Как хук использует настройку. */
    note: string;
}

export interface HookPbxFieldRef {
    entity: HookPbxEntity;
    code: string;
    name: string;
    /** Тип поля Битрикса из реестра. */
    type: string;
    role: HookFieldRole;
    required: boolean;
    note: string | null;
}

export interface HookStageRef {
    entity: HookStageEntity;
    code: string;
    title: string;
    required: boolean;
    note: string | null;
}

export interface HookKbDoc {
    key: string;
    title: string;
    url: string;
    /**
     * Статья опубликована целиком; `false` — на портале пока заготовка
     * «Статья готовится». Необязательное: старый бэк поле не отдаёт.
     */
    ready?: boolean;
}

export interface HookRelated {
    code: string;
    title: string;
}

/** Строка списка каталога (без тяжёлых текстов). */
export interface HookCatalogItem {
    code: string;
    title: string;
    family: HookFamily;
    familyTitle: string;
    kind: HookKind;
    summary: string;
    cron: HookCron | null;
    /** Есть ли у хука операции в app-cache (мониторинг). */
    hasOperations: boolean;
    requiredFieldsCount: number;
    requiredStagesCount: number;
    settingsCount: number;
}

/** Полная карточка хука: теория, параметры, поля, стадии, статьи. */
export interface HookCatalogEntry extends HookCatalogItem {
    /** Теория (markdown). */
    theory: string;
    /** Как работает по факту (markdown). */
    howItWorks: string;
    triggers: string[];
    endpoints: HookEndpoint[];
    params: HookParam[];
    settings: HookSettingRef[];
    pbxFields: HookPbxFieldRef[];
    stages: HookStageRef[];
    kbDocs: HookKbDoc[];
    related: HookRelated[];
    /** Что установить и настроить (markdown). */
    install: string;
    /** Как проверить, что сработало (markdown). */
    verify: string;
    warnings: string[];
    /** Код хука в операциях app-cache; null — операций нет. */
    operationHook: string | null;
}

export interface HookFieldCheck {
    entity: HookPbxEntity;
    code: string;
    name: string;
    role: HookFieldRole;
    required: boolean;
    /** Установлено на портале (по слепку PortalDB). */
    installed: boolean;
    note: string | null;
    /** Раздел админки, где поле ставится (`{portalId}` подставляет фронт). */
    href: string;
}

export interface HookStageCheck {
    entity: HookStageEntity;
    code: string;
    title: string;
    required: boolean;
    /** Сопоставлена/установлена на портале. */
    mapped: boolean;
    note: string | null;
    href: string;
}

export interface HookSettingCheck {
    app: string;
    key: string;
    code: string;
    name: string;
    type: HookSettingType;
    role: HookSettingRole;
    /** Действующее значение на портале. */
    value: HookSettingValue | null;
    default: HookSettingValue;
    /** Значение задано на портале (не дефолт). */
    stored: boolean;
    note: string;
    href: string;
}

export interface PortalHookReadiness {
    code: string;
    title: string;
    family: HookFamily;
    /**
     * ready — всё обязательное есть; partial — часть; not-installed —
     * ничего; none — требований нет.
     */
    status: HookReadinessStatus;
    /** Рубильник: true/false; null — у хука нет рубильника. */
    enabled: boolean | null;
    /** Чего не хватает из обязательного (человеческие названия). */
    missingRequired: string[];
    fields: HookFieldCheck[];
    stages: HookStageCheck[];
    settings: HookSettingCheck[];
}

export interface PortalHooksReadinessResponse {
    portalId: number;
    domain: string;
    hooks: PortalHookReadiness[];
}

export interface HookOperation {
    operationId: string;
    hook: string;
    domain: string;
    /** robot (вебхук) или frame (кнопка). */
    source: string;
    status: HookOperationStatus;
    itemsCount: number;
    queuedAt: string;
    startedAt: string | null;
    finishedAt: string | null;
    error: string | null;
    warningsCount: number | null;
    resultSummary: string | null;
    updatedAt: string | null;
}

export interface HookOperationsByHook {
    hook: string;
    total: number;
    failed: number;
    running: number;
    lastAt: string | null;
}

export interface HookOperationsSummary {
    total: number;
    queued: number;
    running: number;
    done: number;
    failed: number;
    byHook: HookOperationsByHook[];
    lastActivityAt: string | null;
}

export interface PortalHookOperationsResponse {
    portalId: number;
    domain: string;
    /** Пояснение окна наблюдения (операции живут в кэше час). */
    windowNote: string;
    summary: HookOperationsSummary;
    operations: HookOperation[];
}

/** Параметры списка операций (`?hook=&limit=`, limit 1–200). */
export interface HookOperationsQuery {
    hook?: string;
    limit?: number;
}
