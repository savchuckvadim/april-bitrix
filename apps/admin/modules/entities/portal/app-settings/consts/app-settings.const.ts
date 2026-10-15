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
    skap: 'СКАП (импорт клиентов)',
};

/** Тексты панели настроек приложений. */
export const APP_SETTINGS_TEXT = {
    save: 'Сохранить',
    saving: 'Сохранение…',
    empty: 'У приложения пока нет настроек.',
    defaultHint: 'По умолчанию',
    resetToDefault: 'Сбросить на значение по умолчанию',
    loadError: 'Не удалось загрузить настройки приложений',
    searchPlaceholder: 'Поиск: название, код или описание настройки',
    nothingFound: 'Ничего не найдено. Попробуйте другое слово или код.',
    copyCodeHint: 'Код настройки — по нему тоже ищется',
    theoryToggle: 'Как это работает (внутренняя документация)',
    hooksLabel: 'Хуки:',
    pbxFieldsLabel: 'PBX-поля:',
    usageLabel: 'Как используется:',
    gateBadge: 'рубильник',
    requirementsTitle: 'Что установить на портале',
    requirementsHint:
        'Поля и стадии хуков этой категории. * — без них хук теряет основную функцию; остальное хук пропускает молча с предупреждением.',
    stagePrefix: 'стадия',
} as const;
