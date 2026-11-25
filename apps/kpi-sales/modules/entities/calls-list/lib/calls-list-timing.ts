/**
 * Когда уходит запрос списка: сразу или после паузы. Первая загрузка и
 * переход на другую страницу (или другой размер страницы) — сразу; любая
 * правка фильтров, бейджей или порядка — после паузы, чтобы серия нажатий
 * не плодила запросы. Чистая функция.
 */
import type { CallsListQuery } from '../model/types';

type CallsListFilterKey = Exclude<keyof CallsListQuery, 'page' | 'pageSize'>;

/** Всё, что в запросе кроме страницы и её размера (полный список — проверка типов). */
const FILTER_KEYS: Record<CallsListFilterKey, true> = {
    from: true,
    to: true,
    managerIds: true,
    callTypes: true,
    badges: true,
    points: true,
    scoreMin: true,
    scoreMax: true,
    review: true,
    sort: true,
};

const FILTER_KEY_LIST = Object.keys(FILTER_KEYS) as CallsListFilterKey[];

const sameValue = (left: unknown, right: unknown): boolean =>
    JSON.stringify(left) === JSON.stringify(right);

/**
 * Уходит ли запрос для `next` без паузы. `previous` — запрос, ушедший в
 * прошлый раз (null — это первая загрузка). Фильтры, бейджи или порядок
 * изменились — пауза, даже если вместе с ними сменилась страница.
 */
export function isCallsListRequestImmediate(
    previous: CallsListQuery | null,
    next: CallsListQuery,
): boolean {
    if (previous === null) return true;
    return FILTER_KEY_LIST.every(key => sameValue(previous[key], next[key]));
}
