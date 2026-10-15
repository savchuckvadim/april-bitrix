import type {
    HookEndpointKind,
    HookFamily,
    HookFieldRole,
    HookKind,
    HookOperationStatus,
    HookParamWhere,
    HookPbxEntity,
    HookReadinessStatus,
    HookSettingRole,
} from '../model';

/**
 * Тон бэйджа — подмножество `Tone` дизайн-системы (`@workspace/april-ui/tones`).
 * Своим типом, а не импортом: консты читают чистые helpers с тестами.
 */
export type HookBadgeTone =
    | 'neutral'
    | 'muted'
    | 'info'
    | 'success'
    | 'warning'
    | 'destructive';

export interface HookBadgeView {
    label: string;
    tone: HookBadgeTone;
}

/** Порядок показа семейств — как `HOOK_FAMILY_ORDER` бэка. */
export const HOOK_FAMILY_ORDER: readonly HookFamily[] = [
    'sales-hook',
    'lead-request',
    'cold-hook',
    'cron',
];

/** Названия семейств — зеркало `HOOK_FAMILY_TITLES` бэка. */
export const HOOK_FAMILY_TITLE: Record<HookFamily, string> = {
    'sales-hook': 'Хуки отдела продаж (sales-hooks)',
    'lead-request': 'Путь заявки (lead-request)',
    'cold-hook': 'Холодный обзвон (cold-hook)',
    cron: 'Кроны: страховки и отчёты по расписанию',
};

export const HOOK_KIND_LABEL: Record<HookKind, string> = {
    webhook: 'Вебхук',
    button: 'Кнопка',
    cron: 'Крон',
    internal: 'Внутренний',
};

export const HOOK_READINESS_BADGE: Record<HookReadinessStatus, HookBadgeView> = {
    ready: { label: 'Готов', tone: 'success' },
    partial: { label: 'Частично', tone: 'warning' },
    'not-installed': { label: 'Не установлен', tone: 'destructive' },
    none: { label: 'Без требований', tone: 'muted' },
};

/** Рубильник хука: true / false / null (рубильника нет). */
export const HOOK_ENABLED_BADGE = {
    on: { label: 'Включён', tone: 'success' },
    off: { label: 'Выключен', tone: 'destructive' },
    none: { label: '—', tone: 'muted' },
} as const satisfies Record<string, HookBadgeView>;

export const HOOK_OPERATION_STATUS_BADGE: Record<
    HookOperationStatus,
    HookBadgeView
> = {
    queued: { label: 'В очереди', tone: 'info' },
    running: { label: 'Выполняется', tone: 'warning' },
    done: { label: 'Готово', tone: 'success' },
    failed: { label: 'Ошибка', tone: 'destructive' },
};

export const HOOK_ENDPOINT_KIND_LABEL: Record<HookEndpointKind, string> = {
    webhook: 'Вебхук (робот)',
    run: 'Запуск (кнопка)',
    button: 'Кнопка',
    status: 'Статус операции',
};

export const HOOK_PARAM_WHERE_LABEL: Record<HookParamWhere, string> = {
    query: 'query (робот)',
    body: 'body (run)',
};

export const HOOK_SETTING_ROLE_LABEL: Record<HookSettingRole, string> = {
    gate: 'Рубильник',
    param: 'Параметр',
};

export const HOOK_FIELD_ROLE_LABEL: Record<HookFieldRole, string> = {
    reads: 'Читает',
    writes: 'Пишет',
    marker: 'Маркер',
    routing: 'Маршрутизация',
    link: 'Связь',
};

export const HOOK_ENTITY_LABEL: Record<HookPbxEntity, string> = {
    lead: 'Лид',
    deal: 'Сделка',
    company: 'Компания',
    contact: 'Контакт',
    task: 'Задача',
};

/** Имя query-параметра с id портала на глобальных страницах раздела. */
export const HOOKS_PORTAL_QUERY_PARAM = 'portalId';
/**
 * Публичный хост event-sales, на который смотрят адреса роботов и БП —
 * тот же, что в базе знаний и в гайде по хукам.
 */
export const EVENT_SALES_PUBLIC_URL = 'https://api.event-sales.april-app.ru';
/** Подстановка Битрикса: id сущности, по которой сработал робот. */
export const BITRIX_ID_PLACEHOLDER = '{{ID}}';
/** Параметры-идентификаторы, которые робот подставляет сам. */
export const HOOK_ID_LIKE_PARAMS: readonly string[] = [
    'leadId',
    'dealId',
    'entityId',
    'companyId',
];
/** Значение селекта «ничего» (Radix Select не терпит пустой строки). */
export const HOOK_SELECT_NONE_VALUE = '__none__';
/** Сколько операций просить у бэка (1–200). */
export const HOOK_OPERATIONS_LIMIT = 50;
/** Период автообновления операций, пока вкладка «Мониторинг» открыта. */
export const HOOK_OPERATIONS_REFETCH_MS = 15_000;
/** Сколько названий «не хватает: …» показывать в строке каталога. */
export const HOOK_MISSING_PREVIEW_MAX = 3;
/** Каталог статический — пять минут без повторных запросов. */
export const HOOK_CATALOG_STALE_MS = 5 * 60_000;

/** Вкладки карточки хука. */
export const HOOK_TAB = {
    theory: 'theory',
    howItWorks: 'how-it-works',
    endpoints: 'endpoints',
    settings: 'settings',
    fields: 'fields',
    install: 'install',
    monitoring: 'monitoring',
} as const;

export type HookTab = (typeof HOOK_TAB)[keyof typeof HOOK_TAB];

export const HOOK_TAB_LABEL: Record<HookTab, string> = {
    [HOOK_TAB.theory]: 'Теория',
    [HOOK_TAB.howItWorks]: 'Как работает',
    [HOOK_TAB.endpoints]: 'Ручки и параметры',
    [HOOK_TAB.settings]: 'Настройки',
    [HOOK_TAB.fields]: 'Поля и стадии',
    [HOOK_TAB.install]: 'Установка и проверка',
    [HOOK_TAB.monitoring]: 'Мониторинг',
};

/** Тексты раздела «Хуки и автоматика». */
export const HOOKS_TEXT = {
    pageTitle: 'Хуки и автоматика',
    pageDescription:
        'Каталог хуков sales-hooks, пути заявки, холодного обзвона и кронов: что делает каждый, какие поля, стадии и настройки ему нужны, и готов ли он на выбранном портале.',
    portal: 'Портал',
    portalPlaceholder: 'Выберите портал — покажем готовность',
    portalNone: 'Без портала (только каталог)',
    portalLoadError: 'Не удалось загрузить список порталов',
    searchPlaceholder: 'Поиск: название, описание или код хука',
    nothingFound: 'Ничего не найдено. Попробуйте другое слово или код.',
    catalogEmpty: 'Каталог хуков пуст.',
    loading: 'Загрузка…',
    catalogLoadError: 'Не удалось загрузить каталог хуков',
    entryLoadError: 'Не удалось загрузить карточку хука',
    readinessLoading: 'Проверяем готовность на портале…',
    readinessLoadError: 'Не удалось проверить готовность на портале',
    missingPrefix: 'не хватает:',
    andMore: 'и ещё',
    requiredFields: 'обяз. полей',
    requiredStages: 'обяз. стадий',
    settings: 'настроек',
    backToCatalog: 'К каталогу хуков',
    family: 'Семейство',
    kind: 'Запуск',
    cron: 'Расписание',
    readinessOnPortal: 'Готовность на портале',
    selectPortalHint:
        'Выберите портал, чтобы увидеть установленные поля, стадии и значения настроек.',
    theoryEmpty: 'Теории для этого хука пока нет.',
    howItWorksEmpty: 'Описание работы пока не заполнено.',
    triggersTitle: 'Кто вызывает',
    triggersEmpty: 'Источники вызова не описаны.',
    endpointsTitle: 'Ручки',
    endpointsEmpty: 'У хука нет HTTP-ручек (внутренний или крон).',
    endpointExample: 'Пример',
    copy: 'Скопировать',
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать: буфер обмена недоступен',
    builderTitle: 'Конструктор адреса для робота',
    builderDescription:
        'Выберите значения параметров — получите готовый адрес вебхука для робота или бизнес-процесса Битрикса.',
    builderEndpoint: 'Ручка',
    builderNone: 'не передавать',
    builderDefaultHint: 'по умолчанию',
    builderFreeHint: 'Допустимо',
    builderResult: 'Адрес вебхука',
    builderMethodHint:
        'Метод POST; тело — стандартное тело вебхука Битрикса, домен берётся из него.',
    paramsTitle: 'Параметры',
    paramsEmpty: 'Параметров нет.',
    paramName: 'Параметр',
    paramWhere: 'Где',
    paramValues: 'Значения',
    paramDefault: 'По умолчанию',
    paramRequired: 'Обязателен',
    paramRunOnly: 'Только /run',
    paramDescription: 'Что делает',
    yes: 'Да',
    no: '—',
    settingsTitle: 'Настройки портала, которые читает хук',
    settingsEmpty: 'Хук не читает настроек портала.',
    settingName: 'Настройка',
    settingCode: 'Код',
    settingRole: 'Роль',
    settingDefault: 'Дефолт',
    settingValue: 'На портале',
    settingNote: 'Как используется',
    settingStored: 'настроено',
    settingDefaultBadge: 'по умолчанию',
    settingsFormHint:
        'Значения правятся прямо здесь и сохраняются в настройки приложения портала.',
    settingsLoadError: 'Не удалось загрузить настройки приложений портала',
    settingsMissingInSchema:
        'Этот бэк не отдаёт в схеме настроек и править их здесь нельзя',
    save: 'Сохранить',
    saving: 'Сохранение…',
    openAppSettings: 'Все настройки портала',
    fieldsTitle: 'PBX-поля',
    fieldsEmpty: 'Полей не требуется.',
    fieldEntity: 'Сущность',
    fieldName: 'Поле',
    fieldCode: 'Код',
    fieldType: 'Тип',
    fieldRole: 'Роль',
    fieldRequired: 'Обязательно',
    fieldInstalled: 'На портале',
    fieldNote: 'Пояснение',
    installed: 'установлено',
    notInstalled: 'нет',
    stagesTitle: 'Стадии',
    stagesEmpty: 'Стадий не требуется.',
    stageTitle: 'Стадия',
    stageMapped: 'На портале',
    mapped: 'сопоставлена',
    notMapped: 'нет',
    openPbxSection: 'Открыть раздел PBX',
    installTitle: 'Установка',
    installEmpty: 'Инструкции по установке пока нет.',
    verifyTitle: 'Проверка',
    verifyEmpty: 'Инструкции по проверке пока нет.',
    warningsTitle: 'Предупреждения и ловушки',
    kbDocsTitle: 'Клиентская документация (база знаний портала)',
    kbDocsHint:
        'Статьи написаны для клиента и упрощают. Внутренняя документация — эта страница; клиентская пригодится, чтобы знать, что видит клиент.',
    kbDocsEmpty: 'Статей не привязано.',
    effectsTitle: 'Что хук меняет в CRM',
    effectsHint:
        'Сводка из описания хука: какие поля он пишет и читает, какие стадии использует и чем включается.',
    effectsWrites: 'Пишет',
    effectsReads: 'Читает',
    effectsStages: 'Стадии',
    effectsGates: 'Включается настройкой',
    effectsNoGate:
        'Рубильника нет: хук работает всегда, когда его вызывает робот, кнопка или крон.',
    effectsEmpty: 'Хук не пишет и не читает PBX-поля.',
    relatedTitle: 'Связанные хуки',
    relatedEmpty: 'Связанных хуков нет.',
    monitoringTitle: 'Операции за последний час-два',
    monitoringNeedsPortal:
        'Мониторинг операций доступен только для выбранного портала.',
    monitoringLoadError: 'Не удалось загрузить операции',
    monitoringEmpty: 'Операций в окне наблюдения нет.',
    refresh: 'Обновить',
    refreshing: 'Обновляем…',
    lastActivity: 'Последняя активность',
    summaryTotal: 'Всего',
    summaryQueued: 'В очереди',
    summaryRunning: 'Выполняется',
    summaryDone: 'Готово',
    summaryFailed: 'С ошибкой',
    byHookTitle: 'По хукам',
    byHookHook: 'Хук',
    byHookTotal: 'Всего',
    byHookFailed: 'Ошибок',
    byHookRunning: 'В работе',
    byHookLastAt: 'Последняя',
    operationsTitle: 'Операции',
    opStatus: 'Статус',
    opSource: 'Источник',
    opItems: 'Элементов',
    opQueuedAt: 'В очереди с',
    opFinishedAt: 'Завершена',
    opWarnings: 'Предупр.',
    opError: 'Ошибка',
    opResult: 'Результат',
    opHook: 'Хук',
    invalidPortalId: 'Некорректный id портала в адресе страницы.',
    missingTitle: 'Чего не хватает на портале для полной работы хука',
    settingsNoPortalHint:
        'Справочник настроек. Выберите портал — увидите значения и сможете править их здесь.',
    requiredLegend:
        '* — без поля или стадии хук теряет основную функцию; остальное хук пропускает молча (graceful) с предупреждением.',
    kbDocStub: 'статья готовится',
    kbDocStubHint:
        'На портале базы знаний пока заготовка «Статья готовится»; полный текст — в исходниках базы знаний.',
    operationsOfHook: 'Показаны операции хука',
    operationsOfHookTail: ' — через него работает этот крон.',
} as const;
