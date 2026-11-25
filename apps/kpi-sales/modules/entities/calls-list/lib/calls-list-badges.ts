/**
 * Бейджи разборов: какие чипы видны в панели, переключение общих бейджей,
 * круг состояний пункта методики, подписи чипов, сужение типов звонка по
 * методике и бейджи строки таблицы. Чистые функции.
 */
import type {
    CallsListBadgeFacet,
    CallsListCallTypeFacet,
    CallsListItemBadge,
    CallsListPointFacet,
    CallsListPointFilter,
    CallsListPointState,
    CallsListQuery,
} from '../model/types';
import {
    CALLS_LIST_BADGES_MAX,
    CALLS_LIST_POINTS_MAX,
    CALLS_LIST_POINT_ID_PREFIX,
    CALLS_LIST_ROW_BADGES_MAX,
} from './calls-list.const';
import { parseIsoDay } from './calls-list-period';
import { CALLS_LIST_TEXT } from './calls-list.texts';

const T = CALLS_LIST_TEXT.badges;

/** Id пункта методики в списке «Добавить фильтр» и в настройках пользователя. */
export const callsListPointId = (code: string): string =>
    `${CALLS_LIST_POINT_ID_PREFIX}${code}`;

/** Что показано в панели, а что осталось в списке «Добавить фильтр». */
export interface CallsListSplit<Item> {
    visible: Item[];
    rest: Item[];
}

function splitBy<Item>(
    items: readonly Item[],
    isVisible: (item: Item) => boolean,
): CallsListSplit<Item> {
    const visible: Item[] = [];
    const rest: Item[] = [];
    for (const item of items) (isVisible(item) ? visible : rest).push(item);
    return { visible, rest };
}

/**
 * Общие бейджи в панели: основные, выбранные сейчас и добавленные
 * пользователем (порядок бэка); остальные — в «Добавить фильтр».
 */
export function splitCallsListBadges(
    facets: readonly CallsListBadgeFacet[],
    selected: readonly string[],
    added: readonly string[],
): CallsListSplit<CallsListBadgeFacet> {
    const shown = new Set([...selected, ...added]);
    return splitBy(facets, facet => facet.main || shown.has(facet.id));
}

/** Пункты методики в панели — по тем же правилам; добавленные — по id `m:код`. */
export function splitCallsListPoints(
    facets: readonly CallsListPointFacet[],
    selected: readonly CallsListPointFilter[],
    added: readonly string[],
): CallsListSplit<CallsListPointFacet> {
    const shown = new Set([...selected.map(point => callsListPointId(point.code)), ...added]);
    return splitBy(facets, facet => facet.main || shown.has(callsListPointId(facet.code)));
}

/** Общий бейдж: выбран — снять, не выбран — добавить (не больше предела). */
export function toggleCallsListBadge(selected: readonly string[], id: string): string[] {
    if (selected.includes(id)) return selected.filter(current => current !== id);
    return selected.length >= CALLS_LIST_BADGES_MAX ? [...selected] : [...selected, id];
}

/** Состояние пункта в фильтре; пункт не выбран — null. */
export const callsListPointState = (
    points: readonly CallsListPointFilter[],
    code: string,
): CallsListPointState | null =>
    points.find(point => point.code === code)?.state ?? null;

/**
 * Нажатие на пункт методики: выключен → «не исполнено» → «исполнено» →
 * выключен. Порядок остальных пунктов не меняется; новый — в конец, если
 * предел ещё не достигнут.
 */
export function cycleCallsListPoint(
    points: readonly CallsListPointFilter[],
    code: string,
): CallsListPointFilter[] {
    const state = callsListPointState(points, code);
    if (state === null) {
        return points.length >= CALLS_LIST_POINTS_MAX
            ? [...points]
            : [...points, { code, state: 'missed' }];
    }
    if (state === 'done') return points.filter(point => point.code !== code);
    return points.map(point => (point.code === code ? { code, state: 'done' } : point));
}

/** Подпись чипа пункта: выключен — подпись, иначе с состоянием. */
export function callsListPointLabel(
    label: string,
    state: CallsListPointState | null,
): string {
    if (state === 'missed') return T.pointMissed(label);
    if (state === 'done') return T.pointDone(label);
    return label;
}

/** Число на чипе пункта: сколько разборов останется с этим состоянием. */
export const callsListPointCount = (
    facet: Pick<CallsListPointFacet, 'done' | 'missed'>,
    state: CallsListPointState | null,
): number => (state === 'done' ? facet.done : facet.missed);

/** «2026-11-19» → «19.11.2026»; не дата — null. */
function formatSince(since: string | null): string | null {
    if (since === null || !parseIsoDay(since)) return null;
    const [year, month, day] = since.split('-');
    return `${day}.${month}.${year}`;
}

/** Подсказка общего бейджа: пояснение и, если задано, «Считается с ДД.ММ.ГГГГ.». */
export function callsListBadgeHint(
    facet: Pick<CallsListBadgeFacet, 'hint' | 'since'>,
): string {
    const since = formatSince(facet.since);
    return since ? `${facet.hint} ${T.since(since)}`.trim() : facet.hint;
}

/** Подсказка пункта методики: полное название и как работает чип. */
export const callsListPointHint = (facet: Pick<CallsListPointFacet, 'title'>): string =>
    facet.title ? `${facet.title}. ${T.pointCycleHint}` : T.pointCycleHint;

/** Типы звонка выбора, оставшиеся внутри ограничения методики (пересечение). */
export const narrowCallsListTypes = (
    callTypes: readonly string[],
    lock: readonly string[],
): string[] => callTypes.filter(type => lock.includes(type));

/**
 * Что записать в фильтр «Тип звонка», когда методика сузила типы: суженный
 * список, если в выборе есть типы вне ограничения; иначе (нет ограничения
 * или выбор уже внутри него) — null, править нечего.
 */
export function callsListTypesToNarrow(
    callTypes: readonly string[],
    lock: readonly string[] | null | undefined,
): string[] | null {
    if (!lock || callTypes.every(type => lock.includes(type))) return null;
    return narrowCallsListTypes(callTypes, lock);
}

/** Варианты типов звонка под ограничение методики; нет ограничения — как есть. */
export function lockCallsListTypeFacets(
    facets: readonly CallsListCallTypeFacet[],
    lock: readonly string[] | null | undefined,
): CallsListCallTypeFacet[] {
    return lock ? facets.filter(facet => lock.includes(facet.code)) : [...facets];
}

/**
 * Фильтры без бейджей, убранных из «Добавить фильтр» (id — общего бейджа
 * или `m:код` пункта). Ничего не изменилось — null.
 */
export function dropCallsListFilters(
    query: Pick<CallsListQuery, 'badges' | 'points'>,
    ids: readonly string[],
): Pick<CallsListQuery, 'badges' | 'points'> | null {
    const badges = query.badges.filter(id => !ids.includes(id));
    const points = query.points.filter(point => !ids.includes(callsListPointId(point.code)));
    return badges.length === query.badges.length && points.length === query.points.length
        ? null
        : { badges, points };
}

/** Бейджи строки таблицы: первые несколько и сколько скрыто. */
export interface CallsListRowBadgesView {
    shown: CallsListItemBadge[];
    hiddenCount: number;
    /** Названия скрытых бейджей через запятую — для подсказки; скрытых нет — ''. */
    hiddenTitle: string;
}

export function callsListRowBadges(
    badges: readonly CallsListItemBadge[] | undefined,
    limit: number = CALLS_LIST_ROW_BADGES_MAX,
): CallsListRowBadgesView {
    const all = badges ?? [];
    const hidden = all.slice(limit);
    return {
        shown: all.slice(0, limit),
        hiddenCount: hidden.length,
        hiddenTitle: hidden.map(badge => badge.title).join(', '),
    };
}
