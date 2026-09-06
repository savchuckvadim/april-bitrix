import type { AiAnalyticsAuditSource } from '../model';

/** Вариант селекта часового пояса портала. */
export interface AuditTimeZoneOption {
    /** IANA-идентификатор — уходит в запрос как есть. */
    value: string;
    label: string;
}

/**
 * Короткий список поясов российских порталов. Подпись — смещение от МСК:
 * владельцу проще узнать «свой» пояс по нему, чем по названию города.
 */
export const AUDIT_TIME_ZONE_OPTIONS: readonly AuditTimeZoneOption[] = [
    { value: 'Europe/Moscow', label: 'Europe/Moscow — МСК' },
    { value: 'Europe/Kaliningrad', label: 'Europe/Kaliningrad — МСК−1' },
    { value: 'Europe/Samara', label: 'Europe/Samara — МСК+1' },
    { value: 'Asia/Yekaterinburg', label: 'Asia/Yekaterinburg — МСК+2' },
    { value: 'Asia/Omsk', label: 'Asia/Omsk — МСК+3' },
    { value: 'Asia/Novosibirsk', label: 'Asia/Novosibirsk — МСК+4' },
    { value: 'Asia/Krasnoyarsk', label: 'Asia/Krasnoyarsk — МСК+4' },
    { value: 'Asia/Irkutsk', label: 'Asia/Irkutsk — МСК+5' },
    { value: 'Asia/Yakutsk', label: 'Asia/Yakutsk — МСК+6' },
    { value: 'Asia/Vladivostok', label: 'Asia/Vladivostok — МСК+7' },
];

/** Подписи источника отчёта. */
export const AUDIT_SOURCE_LABEL: Record<AiAnalyticsAuditSource, string> = {
    admin: 'ручка админки',
    cron: 'месячный крон',
};

/** Тексты раздела «Аудит данных». */
export const AUDIT_TEXT = {
    pageTitle: 'AI-аналитика ОП — аудит данных',
    formTitle: 'Запуск аудита',
    formDescription:
        'Считает по живой БД, на каких данных строится аналитика отдела продаж: покрытие менеджеров, разборы по ячейкам, шум типов, длительности, версии.',
    portal: 'Портал',
    portalPlaceholder: 'Выберите портал',
    portalSearch: 'Поиск по домену…',
    portalEmpty: 'Порталов не найдено',
    months: 'Месяцев в окне',
    monthsHint: 'Последние календарные месяцы, текущий включительно (1–24).',
    monthsInvalid: 'Целое число от 1 до 24.',
    timeZone: 'Часовой пояс портала',
    save: 'Сохранить снапшот',
    saveHint: 'Записать результат в ais; выключено — только посчитать.',
    run: 'Запустить аудит',
    running: 'Считаем…',
    showLatest: 'Показать последний снапшот',
    loadingLatest: 'Читаем снапшот…',
    noSnapshots: 'Снапшотов по этому порталу ещё нет — запустите аудит или дождитесь месячного крона.',
    runForbiddenTitle: 'Аудит по порталу не разрешён',
    runDisabledHint:
        'Включите признак «Аудит и калибровка данных AI-аналитики разрешены» (ai_analytics_audit_enabled) в настройках приложения kpi-sales портала.',
    portalAiDisabledTitle:
        'AI-аналитика ОП на этом портале выключена (ai_analytics_enabled)',
    portalAiDisabledHint:
        'Включите признак ai_analytics_enabled в настройках приложения kpi-sales портала — форма запуска появится после этого. Последний снапшот можно посмотреть и сейчас.',
    openPortalSettings: 'Открыть настройки портала',
    aiEnabled: 'AI-аналитика включена',
    aiDisabled: 'AI-аналитика выключена',
    auditEnabled: 'аудит разрешён',
    auditDisabled: 'аудит запрещён',
    lastSnapshot: 'Последний снапшот',
    noLastSnapshot: 'снапшотов нет',
    statusLoading: 'Проверяем портал…',
    runError: 'Не удалось запустить аудит',
    latestError: 'Не удалось прочитать снапшот',
    runSuccess: 'Аудит посчитан',
    runSuccessSaved: 'Аудит посчитан, снапшот сохранён',
    aboutTitle: 'Что делает аудит и как читать результат',
    aboutLoadError: 'Не удалось загрузить описание аудита',
    aboutSources: 'Источники данных',
    aboutNotDoing: 'Чего не делает',
    aboutComputes: 'Что считает',
    aboutComputeCode: 'Ключ report',
    aboutComputeTitle: 'Показатель',
    aboutComputeDescription: 'Что считается и зачем',
    aboutSections: 'Разделы отчёта и как их читать',
    aboutRecommendationRule: 'Правило рекомендации',
    aboutStorage: 'Хранение',
    aboutAccess: 'Доступ',
    aboutHowToRun: 'Как запустить',
    resultTitle: 'Результат аудита',
    resultFresh: 'свежий расчёт',
    resultSnapshot: 'снапшот',
    resultGeneratedAt: 'Сформирован',
    resultWindow: 'Окно',
    resultMonths: 'Месяцев',
    resultTimeZone: 'Пояс',
    resultSource: 'Источник',
    totalsTitle: 'Итоги окна',
    recommendationTitle: 'Рекомендация по порогам',
    recommendationRules: 'Пороги правила',
    markdownTitle: 'Отчёт',
    copyMarkdown: 'Скопировать markdown',
    copied: 'Скопировано',
    copyFailed: 'Не удалось скопировать: буфер обмена недоступен',
    jsonTitle: 'Структурированный отчёт (JSON)',
} as const;
