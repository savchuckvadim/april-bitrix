import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import {
    AI_SETTINGS_TABS,
    isAiSettingsTab,
    type AiSettingsTab,
} from './ai-settings-form.util';

/*
 * Подвкладки вкладки «AI аналитика» (как у дайджеста): «Сводка» по
 * умолчанию, «Сотрудники», «Качество звонков», «Настройки витрины».
 * Подвкладка живёт в URL (`?aiTab=`), секция настроек — в `?aiSection=`,
 * чтобы ссылки «открыть настройки целей» из плана дня и чек-листа вели
 * сразу на нужный блок. Переключение данных не перезапрашивает — секции
 * стора общие для всех подвкладок.
 */

export const AI_TABS = [
    {
        key: 'summary',
        label: 'Сводка',
        hint: 'Пульс, итоги периода, «Внимание», повестка планёрки, план дня, план и факт месяца, прогноз отдела.',
    },
    {
        key: 'employees',
        label: 'Сотрудники',
        hint: 'Таблица сигналов по сотрудникам и настройки по людям: уровни, цели по уровням, отсутствия, состав отдела.',
    },
    {
        key: 'quality',
        label: 'Качество звонков',
        hint: 'Таблицы по видам звонков и разделам разговора, три звонка недели для проверки руководителем, разбор по типам.',
    },
    {
        key: 'settings',
        label: 'Настройки витрины',
        hint: 'Связь качества с результатом, общая статистика порталов и «Как считаем» по каждому разделу.',
    },
] as const;

export type AiTabKey = (typeof AI_TABS)[number]['key'];

export const AI_TAB_DEFAULT: AiTabKey = 'summary';

/** Параметры URL: подвкладка и секция настроек, к которой прокрутить. */
export const AI_TAB_PARAM = 'aiTab';
export const AI_SECTION_PARAM = 'aiSection';

export const AI_TABS_TEXT = {
    ariaLabel: 'Разделы вкладки AI аналитики',
} as const;

const TAB_KEYS = new Set<string>(AI_TABS.map(tab => tab.key));

export const isAiTabKey = (value: unknown): value is AiTabKey =>
    typeof value === 'string' && TAB_KEYS.has(value);

/** Подвкладка из параметра; пусто или незнакомое — «Сводка». */
export const parseAiTab = (value: string | null | undefined): AiTabKey =>
    isAiTabKey(value) ? value : AI_TAB_DEFAULT;

/** Секция настроек из параметра; пусто или незнакомое — null. */
export const parseAiSettingsSection = (
    value: string | null | undefined,
): AiSettingsTab | null => (isAiSettingsTab(value) ? value : null);

/** На какой подвкладке живёт секция настроек: по людям — «Сотрудники», витрина — «Настройки витрины». */
export const AI_SETTINGS_TAB_HOME: Record<AiSettingsTab, AiTabKey> = {
    levels: 'employees',
    targets: 'employees',
    absences: 'employees',
    roster: 'employees',
    hypothesis: 'settings',
    pool: 'settings',
};

export const aiTabOfSettingsTab = (tab: AiSettingsTab): AiTabKey =>
    AI_SETTINGS_TAB_HOME[tab];

/** Секции настроек подвкладки «Сотрудники» и «Настройки витрины» в порядке показа. */
export const AI_EMPLOYEE_SETTINGS_SECTIONS: readonly AiSettingsTab[] =
    AI_SETTINGS_TABS.filter(tab => AI_SETTINGS_TAB_HOME[tab] === 'employees');
export const AI_SHOWCASE_SETTINGS_SECTIONS: readonly AiSettingsTab[] =
    AI_SETTINGS_TABS.filter(tab => AI_SETTINGS_TAB_HOME[tab] === 'settings');

/** Id элемента секции настроек на странице — якорь для прокрутки. */
export const aiSettingsSectionId = (tab: AiSettingsTab): string =>
    `ai-settings-${tab}`;

/**
 * Поисковая строка с новой подвкладкой (остальные параметры сохраняются):
 * «Сводка» — без параметра; секция задана — добавляется, иначе убирается.
 */
export const withAiTab = (
    search: string,
    tab: AiTabKey,
    section: AiSettingsTab | null = null,
): string => {
    const params = new URLSearchParams(search);
    if (tab === AI_TAB_DEFAULT) params.delete(AI_TAB_PARAM);
    else params.set(AI_TAB_PARAM, tab);
    if (section) params.set(AI_SECTION_PARAM, section);
    else params.delete(AI_SECTION_PARAM);
    const query = params.toString();
    return query ? `?${query}` : '';
};

/** Страница отчёта и параметр вкладки (`?tab=ai` открывает «AI аналитику»). */
export const AI_REPORT_PATH = '/report';
export const AI_REPORT_TAB_QUERY = `tab=${EReportType.AI}`;

/**
 * Ссылка на подвкладку вкладки AI со страницы сотрудника:
 * `/report?tab=ai&aiTab=employees&aiSection=targets`.
 */
export const aiTabHref = (
    tab: AiTabKey,
    section: AiSettingsTab | null = null,
): string => `${AI_REPORT_PATH}${withAiTab(AI_REPORT_TAB_QUERY, tab, section)}`;
