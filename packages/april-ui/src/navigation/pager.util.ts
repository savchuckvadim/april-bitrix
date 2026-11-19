/**
 * Арифметика переключателя страниц серверного списка: сколько страниц,
 * какие строки на текущей, можно ли назад и вперёд. Страницы считает сервер,
 * сюда приходят только номер, размер и общее число строк.
 */

/** Размеры страницы по умолчанию. */
export const PAGER_DEFAULT_SIZES = [25, 50, 100] as const;

export interface PagerView {
    /** Сколько всего страниц (минимум одна, даже если строк нет). */
    pages: number;
    /** Текущая страница в пределах 1…pages. */
    page: number;
    /** Номер первой строки страницы (с 1); строк нет — 0. */
    from: number;
    /** Номер последней строки страницы; строк нет — 0. */
    to: number;
    hasPrev: boolean;
    hasNext: boolean;
}

const wholeAtLeast = (value: number, min: number): number =>
    Number.isFinite(value) ? Math.max(min, Math.floor(value)) : min;

/** Вид переключателя для страницы `page` по `pageSize` строк из `total`. */
export function pagerView(
    page: number,
    pageSize: number,
    total: number,
): PagerView {
    const size = wholeAtLeast(pageSize, 1);
    const rows = wholeAtLeast(total, 0);
    const pages = Math.max(1, Math.ceil(rows / size));
    const current = Math.min(wholeAtLeast(page, 1), pages);
    return {
        pages,
        page: current,
        from: rows === 0 ? 0 : (current - 1) * size + 1,
        to: Math.min(rows, current * size),
        hasPrev: current > 1,
        hasNext: current < pages,
    };
}
