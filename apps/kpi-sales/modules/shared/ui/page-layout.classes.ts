/**
 * Геометрия каркаса страницы — общая для страниц отчёта и страниц без его
 * обвязки («Разборы звонков», «Настройки отчёта»): шапка и ряд вкладок стоят
 * на одном месте и не прыгают при переходе между вкладками.
 */

/** Поля строки шапки. */
export const PAGE_HEADER_PAD_CLASS = 'px-7 py-2';

/** Строка шапки: название слева, действия справа. */
export const PAGE_HEADER_ROW_CLASS =
    'flex h-12 w-full items-center justify-between gap-2';

/** Содержимое страницы под шапкой. */
export const PAGE_BODY_CLASS = 'px-7 pb-7';

/** Ряд вкладок под шапкой. */
export const PAGE_TABS_ROW_CLASS =
    'mt-6 mb-4 flex min-h-10 w-full items-center justify-between rounded-md p-0';
