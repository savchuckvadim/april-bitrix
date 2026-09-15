/**
 * Маршруты процесса и вкладки бокового меню.
 *
 * Обе страницы делят одну конфигурацию (ползунки + ответы), поэтому переход
 * между ними её не теряет: симулятор проходит именно ту схему, которую вы
 * собрали на схеме процесса.
 */

import type {
    ProcessTab,
    SectionDefinition,
} from '../section/section-definition';
import { sectionTabPath } from '../section/section-definition';

export type { ProcessTab } from '../section/section-definition';

export const SALES_BASE_PATH = '/process/sales';

/**
 * Схема-конфигуратор переехала с корня на свой маршрут: корень занял обзор.
 * Порядок разделов теперь повторяет порядок чтения — сначала «зачем», потом
 * «почему», и только потом «как настроено».
 */
export const SALES_SCHEMA_PATH = '/process/sales/schema';

/** Повествовательные страницы: «почему так», а не «как настроено». */
export const THEORY_TABS: ProcessTab[] = [
    {
        slug: 'theory/inbound',
        label: 'Теория · лиды',
        hint: 'Откуда берутся клиенты, почему из-за них ссорятся и как сделать так, чтобы не ссорились',
    },
    {
        slug: 'theory/funnel',
        label: 'Теория · основная воронка',
        hint: 'Почему воронка — лестница, откуда берётся KPI и зачем менеджеру одна форма вместо десяти полей',
    },
];

export const SALES_TABS: ProcessTab[] = [
    {
        slug: '',
        label: 'О документе',
        hint: 'Что здесь описано, какую задачу решает и что вы отсюда унесёте',
    },
    {
        slug: 'theory/inbound',
        label: 'Теория · лиды',
        hint: 'Откуда берутся клиенты и почему из-за них ссорятся',
    },
    {
        slug: 'theory/funnel',
        label: 'Теория · воронка',
        hint: 'Почему воронка — лестница и откуда берётся KPI',
    },
    {
        slug: 'schema',
        label: 'Схема процесса',
        hint: 'Настройки, хребет процесса и разбор по стадиям',
    },
    {
        slug: 'simulator',
        label: 'Симулятор',
        hint: 'Пройти процесс шаг за шагом на своей конфигурации',
    },
];

/** Подпись группы вкладок в боковом меню раздела продаж. */
export const SALES_SECTION_EYEBROW = 'Процесс продажи';

/** Раздел продаж как определение для рамы; дефолт контекста раздела. */
export const SALES_SECTION: SectionDefinition = {
    basePath: SALES_BASE_PATH,
    tabs: SALES_TABS,
    eyebrow: SALES_SECTION_EYEBROW,
};

export const salesTabPath = (slug: string): string =>
    sectionTabPath(SALES_SECTION, slug);
