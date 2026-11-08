/** Чем бэкенд ходит в портал (`bitrix_auth_mode`) — по-русски. */
export const AUTH_MODE_TITLE: Record<string, string> = {
    webhook: 'вебхук портала',
    app: 'токен приложения',
    auto: 'автоматически (приложение, если установлено)',
};

/** Виджеты приложения April (коды реестра app_widgets) — по-русски. */
export const WIDGET_TITLE: Record<string, string> = {
    'event-sales': 'Звонки (ОП)',
    konstructor: 'Конструктор КП',
    'report-sales': 'Отчёт ОП KPI',
    'event-service': 'Звонки (сервис)',
    'konstructor-service': 'Конструктор КП (сервис)',
    'report-service': 'Отчёт КЦ KPI',
};
