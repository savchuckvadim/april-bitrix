/**
 * Фильтры списка разборов в адресе страницы (`?from=&to=&managers=&types=
 * &scoreMin=&scoreMax=&review=&sort=&page=&size=`): разбор адреса, сборка
 * адреса, правки фильтров и тело запроса. Значения по умолчанию в адрес не
 * пишутся; кривое значение в адресе заменяется умолчанием. «Сегодня»
 * приходит снаружи — функции чистые.
 */
import {
    CALLS_LIST_PAGE_SIZES,
    CALLS_LIST_REVIEW_FILTERS,
    CALLS_LIST_SORTS,
    type CallsListPageSize,
    type CallsListQuery,
    type CallsListRequest,
    type CallsListRequester,
    type CallsListReviewFilter,
    type CallsListSort,
} from '../model/types';
import {
    CALLS_LIST_DEFAULT_PAGE_SIZE,
    CALLS_LIST_FILTER_MAX_ITEMS,
    CALLS_LIST_PARAMS as P,
    CALLS_LIST_SCORE_RANGE,
} from './calls-list.const';
import { defaultCallsListPeriod, parseIsoDay } from './calls-list-period';

/** Правка фильтров; без `page` страница сбрасывается на первую. */
export type CallsListPatch = Partial<Omit<CallsListQuery, 'page'>> & {
    page?: number;
};

const USER_ID = /^\d{1,12}$/;
const TYPE_CODE_MAX = 64;
const LIST_SEPARATOR = ',';

const isOneOf = <T extends string>(
    values: readonly T[],
    value: string | null,
): value is T => value !== null && (values as readonly string[]).includes(value);

/** Фильтры по умолчанию: последние 30 дней, всё, новые сверху, страница 1. */
export function defaultCallsListQuery(today: Date): CallsListQuery {
    return {
        ...defaultCallsListPeriod(today),
        managerIds: [],
        callTypes: [],
        scoreMin: null,
        scoreMax: null,
        review: 'any',
        sort: 'date_desc',
        page: 1,
        pageSize: CALLS_LIST_DEFAULT_PAGE_SIZE,
    };
}

const uniqueList = (raw: string | null, valid: (item: string) => boolean): string[] =>
    [
        ...new Set(
            (raw ?? '')
                .split(LIST_SEPARATOR)
                .map(item => item.trim())
                .filter(valid),
        ),
    ].slice(0, CALLS_LIST_FILTER_MAX_ITEMS);

/** Оценка 1–10 (можно с одним знаком); иначе null. */
const parseScore = (raw: string | null): number | null => {
    if (raw === null || raw.trim() === '') return null;
    const value = Number(raw);
    return Number.isFinite(value) &&
        value >= CALLS_LIST_SCORE_RANGE.min &&
        value <= CALLS_LIST_SCORE_RANGE.max
        ? value
        : null;
};

const parsePage = (raw: string | null): number => {
    const value = Number(raw);
    return Number.isInteger(value) && value >= 1 ? value : 1;
};

const parsePageSize = (raw: string | null): CallsListPageSize =>
    CALLS_LIST_PAGE_SIZES.find(size => String(size) === raw) ??
    CALLS_LIST_DEFAULT_PAGE_SIZE;

/** Границы оценки по порядку: «от 8 до 3» → «от 3 до 8». */
export function orderedScoreRange(
    scoreMin: number | null,
    scoreMax: number | null,
): { scoreMin: number | null; scoreMax: number | null } {
    return scoreMin !== null && scoreMax !== null && scoreMin > scoreMax
        ? { scoreMin: scoreMax, scoreMax: scoreMin }
        : { scoreMin, scoreMax };
}

/** Фильтры из адреса; кривое значение — умолчание. */
export function parseCallsListQuery(
    search: string | URLSearchParams,
    today: Date,
): CallsListQuery {
    const params = new URLSearchParams(search);
    const defaults = defaultCallsListQuery(today);
    const day = (key: string, fallback: string): string => {
        const raw = params.get(key);
        return raw !== null && parseIsoDay(raw) ? raw : fallback;
    };
    const review = params.get(P.review);
    const sort = params.get(P.sort);
    return {
        from: day(P.from, defaults.from),
        to: day(P.to, defaults.to),
        managerIds: uniqueList(params.get(P.managers), item => USER_ID.test(item)),
        callTypes: uniqueList(
            params.get(P.types),
            item => item.length > 0 && item.length <= TYPE_CODE_MAX,
        ),
        ...orderedScoreRange(
            parseScore(params.get(P.scoreMin)),
            parseScore(params.get(P.scoreMax)),
        ),
        review: isOneOf<CallsListReviewFilter>(CALLS_LIST_REVIEW_FILTERS, review)
            ? review
            : defaults.review,
        sort: isOneOf<CallsListSort>(CALLS_LIST_SORTS, sort) ? sort : defaults.sort,
        page: parsePage(params.get(P.page)),
        pageSize: parsePageSize(params.get(P.size)),
    };
}

/** Адрес страницы для фильтров: '' или '?…'; значения по умолчанию не пишутся. */
export function buildCallsListSearch(query: CallsListQuery, today: Date): string {
    const defaults = defaultCallsListQuery(today);
    const params = new URLSearchParams();
    const put = (key: string, value: string, fallback: string): void => {
        if (value !== fallback) params.set(key, value);
    };
    put(P.from, query.from, defaults.from);
    put(P.to, query.to, defaults.to);
    put(P.managers, query.managerIds.join(LIST_SEPARATOR), '');
    put(P.types, query.callTypes.join(LIST_SEPARATOR), '');
    put(P.scoreMin, query.scoreMin === null ? '' : String(query.scoreMin), '');
    put(P.scoreMax, query.scoreMax === null ? '' : String(query.scoreMax), '');
    put(P.review, query.review, defaults.review);
    put(P.sort, query.sort, defaults.sort);
    put(P.page, String(query.page), String(defaults.page));
    put(P.size, String(query.pageSize), String(defaults.pageSize));
    const text = params.toString();
    return text ? `?${text}` : '';
}

/**
 * Фильтры после правки: смена любого фильтра, порядка или размера страницы
 * возвращает на первую страницу; границы оценки — по порядку.
 */
export function patchCallsListQuery(
    query: CallsListQuery,
    patch: CallsListPatch,
): CallsListQuery {
    const next = { ...query, ...patch, page: patch.page ?? 1 };
    return { ...next, ...orderedScoreRange(next.scoreMin, next.scoreMax) };
}

/** Сброс фильтров и порядка; размер страницы остаётся. */
export function resetCallsListFilters(
    query: CallsListQuery,
    today: Date,
): CallsListQuery {
    return { ...defaultCallsListQuery(today), pageSize: query.pageSize };
}

/** Задан ли хоть один фильтр или порядок не по умолчанию. */
export function isCallsListFiltered(query: CallsListQuery, today: Date): boolean {
    const reset = resetCallsListFilters(query, today);
    return (
        buildCallsListSearch({ ...query, page: 1 }, today) !==
        buildCallsListSearch(reset, today)
    );
}

/** Тело запроса списка: пустые фильтры не отправляются. */
export function callsListRequestOf(
    query: CallsListQuery,
    requester: CallsListRequester,
): CallsListRequest {
    return {
        ...requester,
        from: query.from,
        to: query.to,
        ...(query.managerIds.length > 0 && { managerIds: query.managerIds }),
        ...(query.callTypes.length > 0 && { callTypes: query.callTypes }),
        ...(query.scoreMin !== null && { scoreMin: query.scoreMin }),
        ...(query.scoreMax !== null && { scoreMax: query.scoreMax }),
        review: query.review,
        sort: query.sort,
        page: query.page,
        pageSize: query.pageSize,
    };
}

/**
 * Страница за последней (строки под фильтры есть, а на этой странице пусто —
 * например, после сужения фильтров по старому адресу): номер последней
 * страницы, куда перейти; иначе null.
 */
export function callsListOverflowPage(
    query: Pick<CallsListQuery, 'page' | 'pageSize'>,
    response: { total: number; itemsCount: number },
): number | null {
    if (response.total <= 0 || response.itemsCount > 0 || query.page <= 1) {
        return null;
    }
    const last = Math.max(1, Math.ceil(response.total / query.pageSize));
    return last < query.page ? last : null;
}
