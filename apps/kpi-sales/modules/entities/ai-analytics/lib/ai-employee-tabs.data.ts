/*
 * Подвкладки раздела «AI-аналитика» на странице сотрудника (/report/user):
 * ключи, подписи и подсказки, параметр URL `aiUserTab=`. Лежит в сущности,
 * потому что ссылку строит вкладка «AI аналитика» (виджет
 * ai-analytics-report), а читает — страница сотрудника (виджет
 * ai-employee): оба импортируют один словарь, виджеты друг от друга не
 * зависят. Тексты — по-русски, без кодов и формул (тест на правила рядом).
 */

export const AI_EMPLOYEE_TABS = [
    {
        key: 'brief',
        label: 'Коротко',
        hint: 'Главное о сотруднике за период: оценка AI, уровень и цель месяца, стиль одной фразой, что растёт и что снижается.',
    },
    {
        key: 'target',
        label: 'К цели',
        hint: 'План и факт месяца по показателям, план на сегодня и чем, скорее всего, закончится месяц.',
    },
    {
        key: 'quality',
        label: 'Качество',
        hint: 'Оценки по неделям и месяцам, профиль по видам звонков и разделам разговора рядом со средним по отделу, тренды словами.',
    },
    {
        key: 'style',
        label: 'Стиль',
        hint: 'Как сотрудник работает: черты стиля с отклонением от коллег. Это не оценка качества.',
    },
    {
        key: 'calls',
        label: 'Звонки',
        hint: 'Звонки с низкой оценкой и риск-звонки с цитатами и ссылками на разбор, возражения клиентов и доля отработанных.',
    },
    {
        key: 'feedback',
        label: 'Обратная связь',
        hint: 'Реакции на витрину по этому сотруднику, отметки руководителя по звонкам недели и советы с отметками «Сделано».',
    },
] as const;

export type AiEmployeeTab = (typeof AI_EMPLOYEE_TABS)[number]['key'];

export const AI_EMPLOYEE_TAB_DEFAULT: AiEmployeeTab = 'brief';

/** Параметр URL подвкладки AI-раздела страницы сотрудника. */
export const AI_EMPLOYEE_TAB_PARAM = 'aiUserTab';

/** Страница сотрудника и её параметр Bitrix-id (как у ссылок таблиц KPI). */
export const AI_EMPLOYEE_PAGE_PATH = '/report/user';
export const AI_EMPLOYEE_USER_PARAM = 'userId';

const TAB_KEYS = new Set<string>(AI_EMPLOYEE_TABS.map(tab => tab.key));

export const isAiEmployeeTab = (value: unknown): value is AiEmployeeTab =>
    typeof value === 'string' && TAB_KEYS.has(value);

/** Подвкладка из значения параметра; пусто или незнакомое — «Коротко». */
export const parseAiEmployeeTab = (
    value: string | null | undefined,
): AiEmployeeTab =>
    isAiEmployeeTab(value) ? value : AI_EMPLOYEE_TAB_DEFAULT;

/** Подпись подвкладки по ключу. */
export const aiEmployeeTabLabel = (tab: AiEmployeeTab): string =>
    AI_EMPLOYEE_TABS.find(item => item.key === tab)?.label ??
    AI_EMPLOYEE_TABS[0].label;

/**
 * Ссылка на страницу сотрудника; с подвкладкой, отличной от «Коротко», —
 * с параметром `aiUserTab=`: `/report/user?userId=7&aiUserTab=calls`.
 */
export const aiEmployeeHref = (
    managerId: string,
    tab: AiEmployeeTab = AI_EMPLOYEE_TAB_DEFAULT,
): string => {
    const params = new URLSearchParams();
    params.set(AI_EMPLOYEE_USER_PARAM, managerId);
    if (tab !== AI_EMPLOYEE_TAB_DEFAULT) params.set(AI_EMPLOYEE_TAB_PARAM, tab);
    return `${AI_EMPLOYEE_PAGE_PATH}?${params.toString()}`;
};

/** Поисковая строка страницы с новой подвкладкой (остальные параметры остаются). */
export const withAiEmployeeTab = (search: string, tab: AiEmployeeTab): string => {
    const params = new URLSearchParams(search);
    if (tab === AI_EMPLOYEE_TAB_DEFAULT) params.delete(AI_EMPLOYEE_TAB_PARAM);
    else params.set(AI_EMPLOYEE_TAB_PARAM, tab);
    const query = params.toString();
    return query ? `?${query}` : '';
};
