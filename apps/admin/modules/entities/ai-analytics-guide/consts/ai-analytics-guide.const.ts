import type { GuideEndpointApp } from '../model';

/** Путь страницы путеводителя; раздел — якорем `#<code>`. */
export const GUIDE_PATH = '/ai-analytics/guide';

/** Параметр адреса с выбранным порталом (как у раздела «Хуки»). */
export const GUIDE_PORTAL_QUERY_PARAM = 'portalId';

/** Раздел «Запуск после выкладки»: над чек-листом — панель больших кнопок. */
export const GUIDE_LAUNCH_SECTION_CODE = 'launch-after-release';

/** Каталог статический — час в кэше, как у каталога хуков. */
export const GUIDE_STALE_MS = 60 * 60 * 1000;

/** Подписи приложений, в которых живут ручки. */
export const GUIDE_APP_LABEL: Record<GuideEndpointApp, string> = {
    admin: 'admin (эта админка)',
    'kpi-report-sales': 'kpi-report-sales',
    'event-sales': 'event-sales',
};

/** Слой переопределения параметра реестра. */
export const GUIDE_SCOPE_LABEL: Record<string, string> = {
    global: 'глобально (только код)',
    portal: 'портал',
    tenure: 'полоса стажа',
    manager: 'менеджер',
};

/** Класс параметра реестра. */
export const GUIDE_SOURCE_LABEL: Record<string, string> = {
    configured: 'решение человека',
    estimated: 'оценка из данных',
    hybrid: 'гибрид (прайор + данные)',
};

export const GUIDE_TEXT = {
    pageTitle: 'AI-аналитика ОП — путеводитель',
    pageDescription:
        'Что с чем связано: теория по каждому узлу AI-аналитики, ключи настроек kpiSales, поля конвейера портала, коды реестра параметров, документы базы знаний, ручки и страницы админки. Выберите портал — ссылки поведут в его карточку, а формы «Запуск» будут бить по его домену.',
    tocTitle: 'Разделы',
    portal: 'Портал',
    portalPlaceholder: 'Выберите портал',
    portalSearch: 'Поиск по домену…',
    portalEmpty: 'Порталов не найдено',
    portalHint:
        'Без портала ссылки в карточку портала отключены, формы «Запуск» недоступны.',
    loading: 'Загрузка…',
    listLoadError: 'Не удалось загрузить оглавление путеводителя',
    entryLoadError: 'Не удалось загрузить раздел путеводителя',
    theoryTitle: 'Теория',
    relatedTitle: 'Связано',
    settingsTitle: 'Настройки kpiSales (карточка портала → «Настройки приложений»)',
    settingsEmpty: 'Ключи kpiSales с разделом не связаны.',
    portalAiSettingsTitle: 'Настройки AI портала (карточка портала → «Настройки AI»)',
    portalAiSettingsEmpty: 'Поля конвейера с разделом не связаны.',
    paramsTitle: 'Параметры реестра',
    paramsHint:
        'Названия, слой, дефолт и диапазон — из реестра libs/sales-ai-analytics/src/params. Переопределяются в ключе ai_analytics_model_params портала (слой «портал» / «менеджер»); значение вне диапазона не применяется.',
    paramsEmpty: 'Коды реестра с разделом не связаны.',
    openModelParams: 'Открыть ai_analytics_model_params',
    kindsTitle: 'База знаний (kind)',
    kindsEmpty: 'Документы базы знаний с разделом не связаны.',
    openKind: 'Открыть в базе знаний портала',
    clientEditable: 'правит клиент',
    aprilOnly: 'ведёт April',
    consumer: 'читает',
    pagesTitle: 'Страницы админки',
    relatedSectionsTitle: 'Смежные разделы',
    endpointsTitle: 'Ручки',
    endpointsEmpty: 'Ручек у раздела нет.',
    endpointWhen: 'Когда',
    endpointPurpose: 'Зачем',
    endpointBody: 'Тело запроса',
    endpointQuery: 'Параметры запроса',
    launchTitle: 'Чек-лист запуска',
    launchHint:
        'Шаги по порядку и что под капотом у каждой кнопки панели выше. Где у шага есть форма — она бьёт по выбранному порталу (ручки admin — с подтверждением; для kpi-report-sales и event-sales готовится тело для Swagger). Формы отдельных ручек — в списке «Ручки» ниже, для разработчика.',
    run: 'Выполнить',
    running: 'Выполняем…',
    confirmTitle: 'Выполнить запрос?',
    confirmDescription:
        'Запрос уйдёт на бэк admin по выбранному порталу. Для джоб ответ придёт сразу, а сам расчёт пойдёт в воркере.',
    confirm: 'Выполнить',
    cancel: 'Отмена',
    result: 'Ответ',
    resultEmpty: 'Пустой ответ.',
    runError: 'Запрос не выполнен',
    externalTitle: 'Выполнить в Swagger приложения',
    externalHint:
        'Из админки до этой ручки клиента нет. Откройте Swagger приложения (путь /docs/api на его хосте), найдите ручку и вставьте тело ниже.',
    externalBody: 'Готовое тело запроса',
    copy: 'Скопировать',
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать: буфер обмена недоступен',
    noPortalForRun: 'Выберите портал, чтобы выполнить запрос.',
    noPortalForLink: 'нужен портал',
    scope: 'Слой',
    source: 'Класс',
    defaultValue: 'По умолчанию',
    range: 'Диапазон',
    unit: 'Единица',
    breaksSeries: 'рвёт ряд',
    phase: 'Фаза',
    group: 'Группа',
    guideButton: 'Путеводитель',
    guideButtonTitle: 'Путеводитель по AI-аналитике: теория и связи настроек',
    relatedBlockTitle: 'Как связано',
    relatedBlockDescription:
        'Настройки конвейера влияют на всё, что ниже по цепочке: разборы → витрина и рассылки kpiSales → модель. Где смотреть и что ещё настроить:',
} as const;
