/**
 * Описание раздела для рамы процесса.
 *
 * Рама (`ProcessShell`, вкладки, карточки «куда дальше», подвал теории) не
 * знает, какой раздел показывает: ей нужен базовый путь, список вкладок и
 * подпись группы в боковом меню. Раздел продаж и база знаний AI подключают
 * одну и ту же раму с разными определениями.
 */

export interface ProcessTab {
    /** Кусок маршрута после базового пути; пустая строка — базовая вкладка. */
    slug: string;
    label: string;
    hint: string;
}

export interface SectionDefinition {
    /** Базовый путь раздела, без завершающего слэша: `/process/sales`. */
    basePath: string;
    /** Вкладки в порядке чтения; первая — обзор с пустым slug. */
    tabs: ProcessTab[];
    /** Подпись группы вкладок в боковом меню. */
    eyebrow?: string;
}

/** Полный путь вкладки внутри раздела. */
export const sectionTabPath = (
    definition: SectionDefinition,
    slug: string,
): string => (slug ? `${definition.basePath}/${slug}` : definition.basePath);

/**
 * Индекс вкладки по slug страницы. Страница может назвать себя коротко
 * (`funnel`), а вкладка — полным путём (`theory/funnel`): совпадение считается
 * по последнему сегменту. Пустой slug — только базовая вкладка.
 */
export const findTabIndex = (
    definition: SectionDefinition,
    slug: string,
): number =>
    definition.tabs.findIndex(
        tab => tab.slug === slug || (slug !== '' && tab.slug.endsWith(`/${slug}`)),
    );
