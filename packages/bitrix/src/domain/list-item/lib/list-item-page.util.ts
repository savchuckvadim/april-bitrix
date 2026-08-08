import {
    IBXListItem,
    IBXListItemPage,
} from '../interface/bx-list-item.interface';

/** Сколько элементов отдаёт Битрикс за один вызов `lists.element.get`. */
export const BX_LIST_PAGE_SIZE = 50;

/**
 * Единственное место разбора ответа `lists.element.get`.
 *
 * Форма ответа зависит от транспорта: во фрейме SDK может отдать голый массив,
 * через обёртку — `{ result, next, total }`, а в batch-ответах встречаются обе.
 * Разбираем все, чтобы потребители не гадали (исторический разбор жил в
 * event-sales/EVHistory/history-list-helper и копился бы по приложениям).
 */
export const toListItemPage = (
    raw: unknown,
    start: number,
): IBXListItemPage => {
    if (Array.isArray(raw)) {
        const elements = raw as IBXListItem[];
        return {
            elements,
            next:
                elements.length === BX_LIST_PAGE_SIZE
                    ? start + BX_LIST_PAGE_SIZE
                    : null,
            total: null,
        };
    }

    const wrapped = (raw ?? {}) as {
        result?: unknown;
        next?: number;
        total?: number;
    };
    const elements = Array.isArray(wrapped.result)
        ? (wrapped.result as IBXListItem[])
        : [];
    const next =
        typeof wrapped.next === 'number'
            ? wrapped.next
            : elements.length === BX_LIST_PAGE_SIZE
              ? start + BX_LIST_PAGE_SIZE
              : null;
    return {
        elements,
        next,
        total: typeof wrapped.total === 'number' ? wrapped.total : null,
    };
};
