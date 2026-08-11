import { PortalAppSettingsBlockDtoAppCode } from '@workspace/nest-admin-api';

/** Русские названия приложений для заголовков блоков. */
export const PORTAL_APP_TITLE: Record<
    PortalAppSettingsBlockDtoAppCode,
    string
> = {
    portal: 'Портал (общие)',
    sales: 'Отдел продаж',
    'kpi-sales': 'KPI продаж',
    'event-sales': 'Звонки (event-sales)',
    konstructor: 'Конструктор',
};

/** Тексты панели настроек приложений. */
export const APP_SETTINGS_TEXT = {
    save: 'Сохранить',
    saving: 'Сохранение…',
    empty: 'У приложения пока нет настроек.',
    defaultHint: 'По умолчанию',
    resetToDefault: 'Сбросить на значение по умолчанию',
    loadError: 'Не удалось загрузить настройки приложений',
} as const;
