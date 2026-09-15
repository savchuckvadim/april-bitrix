/**
 * Раздел «AI для отдела продаж»: базовый путь и вкладки в порядке чтения.
 *
 * Порядок = порядок чтения: сначала «что и зачем», потом «как устроено»,
 * потом «как настроить», в конце брифы. Каждая вкладка — своя страница
 * `app/(product)/ai/<slug>/page.tsx` и константа `constants/pages/<имя>.ts`.
 */

import type {
    ProcessTab,
    SectionDefinition,
} from '../../process/_core/section/section-definition';

export const AI_BASE_PATH = '/ai';

/** Подпись группы вкладок в боковом меню. */
export const AI_SECTION_EYEBROW = 'AI для отдела продаж';

export const AI_TABS: ProcessTab[] = [
    {
        slug: '',
        label: 'О документе',
        hint: 'Что здесь описано, для кого, как читать и что уже работает',
    },
    {
        slug: 'needs',
        label: 'Что закрывает',
        hint: 'Потребности руководителя и менеджера, а не список функций',
    },
    {
        slug: 'theory/call-analysis',
        label: 'Как AI разбирает звонок',
        hint: 'Конвейер от записи до разбора и его честные ограничения',
    },
    {
        slug: 'theory/call-types',
        label: 'Типы звонков',
        hint: 'Девять типов, их признаки и связь со стадиями CRM',
    },
    {
        slug: 'smart',
        label: 'Смарт-процесс разбора',
        hint: 'Карточка разбора в Битрикс24, поля и связи с сущностями',
    },
    {
        slug: 'analytics',
        label: 'Аналитика отдела',
        hint: 'Пульс, внимание, повестка планёрки и таблица менеджер × тип',
    },
    {
        slug: 'theory/numbers',
        label: 'Как читать цифры',
        hint: 'Что такое n, интервал, доверие и почему нет рейтинга людей',
    },
    {
        slug: 'push',
        label: 'Push-контур',
        hint: 'Кому, когда и что приходит: алерты, повестка, дайджесты',
    },
    {
        slug: 'settings',
        label: 'Настройки',
        hint: 'Все ключи, значения по умолчанию и что ломает сравнимость',
    },
    {
        slug: 'bitrix',
        label: 'Интеграция с Битрикс24',
        hint: 'Что читаем, что пишем, что должно быть на портале',
    },
    {
        slug: 'setup',
        label: 'Инструкции по настройке',
        hint: 'Пошагово, со скринами: от телефонии до проверочного чек-листа',
    },
    {
        slug: 'calibration',
        label: 'Калибровка',
        hint: 'Зачем, сколько времени и что получаете в результате',
    },
    {
        slug: 'glossary',
        label: 'Словарь',
        hint: 'Термины с определениями и ссылками на главы',
    },
    {
        slug: 'roadmap',
        label: 'Готовность и что дальше',
        hint: 'Что работает, что в работе, что открыто — без обещаний сроков',
    },
    {
        slug: 'briefs',
        label: 'Брифы',
        hint: 'Общий бриф подключения и бриф оценки одного звонка',
    },
];

/** Раздел AI как определение для рамы процесса. */
export const AI_SECTION: SectionDefinition = {
    basePath: AI_BASE_PATH,
    tabs: AI_TABS,
    eyebrow: AI_SECTION_EYEBROW,
};

/**
 * Имя файла контента вкладки в `constants/pages/`: последний сегмент slug,
 * для базовой вкладки — `overview`.
 */
export const aiPageFileName = (slug: string): string =>
    slug === '' ? 'overview' : (slug.split('/').pop() ?? slug);
