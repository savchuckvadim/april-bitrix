/**
 * Раздел «Разборы звонков» (POST api/ai-analytics/calls/list): запрос,
 * ответ и состояние фильтров страницы. Клиента ручки ещё не сгенерировали —
 * типы руками по DTO бэка (calls-list-request.dto.ts, calls-list.dto.ts).
 */

/** Фильтр по отзывам руководителей. */
export const CALLS_LIST_REVIEW_FILTERS = [
    'any',
    'reviewed',
    'not_reviewed',
    'disagreed',
] as const;
export type CallsListReviewFilter = (typeof CALLS_LIST_REVIEW_FILTERS)[number];

/** Порядок строк. */
export const CALLS_LIST_SORTS = [
    'date_desc',
    'date_asc',
    'score_asc',
    'score_desc',
] as const;
export type CallsListSort = (typeof CALLS_LIST_SORTS)[number];

/** Сколько строк на странице можно выбрать. */
export const CALLS_LIST_PAGE_SIZES = [25, 50, 100] as const;
export type CallsListPageSize = (typeof CALLS_LIST_PAGE_SIZES)[number];

/** Состояние пункта методики в фильтре: исполнен или не исполнен в звонке. */
export const CALLS_LIST_POINT_STATES = ['done', 'missed'] as const;
export type CallsListPointState = (typeof CALLS_LIST_POINT_STATES)[number];

/** Фильтр по пункту методики: код пункта и нужное состояние. */
export interface CallsListPointFilter {
    code: string;
    state: CallsListPointState;
}

/** Окраска бейджа с бэка: проблема, предупреждение, нейтральный, хороший. */
export const CALLS_LIST_BADGE_TONES = ['bad', 'warn', 'neutral', 'good'] as const;
export type CallsListBadgeTone = (typeof CALLS_LIST_BADGE_TONES)[number];

/** Фильтры, порядок и страница — то, что живёт в адресе страницы. */
export interface CallsListQuery {
    /** Начало периода, YYYY-MM-DD, включительно. */
    from: string;
    /** Конец периода, YYYY-MM-DD, включительно. */
    to: string;
    managerIds: string[];
    callTypes: string[];
    /** Общие бейджи (id); пусто — без фильтра. */
    badges: string[];
    /** Пункты методики с нужным состоянием; пусто — без фильтра. */
    points: CallsListPointFilter[];
    /** Оценка AI от (1–10); null — без нижней границы. */
    scoreMin: number | null;
    /** Оценка AI до (1–10); null — без верхней границы. */
    scoreMax: number | null;
    review: CallsListReviewFilter;
    sort: CallsListSort;
    /** Страница, с 1. */
    page: number;
    pageSize: CallsListPageSize;
}

/** Кто спрашивает: домен портала и Bitrix-id пользователя сессии. */
export interface CallsListRequester {
    domain: string;
    requesterUserId: string;
}

/** Тело запроса списка. */
export interface CallsListRequest extends CallsListRequester {
    from: string;
    to: string;
    managerIds?: string[];
    callTypes?: string[];
    badges?: string[];
    points?: CallsListPointFilter[];
    scoreMin?: number;
    scoreMax?: number;
    review: CallsListReviewFilter;
    sort: CallsListSort;
    page: number;
    pageSize: number;
}

/** Мой отзыв о разборе — коротко. */
export interface CallsListMyReview {
    leaderScore: number | null;
    agree: boolean;
}

/** Отзывы руководителей о разборе — сводка строки. */
export interface CallsListReviews {
    count: number;
    disagreeCount: number;
    avgLeaderScore: number | null;
    mine: CallsListMyReview | null;
    lastAt: string | null;
}

/** Бейдж-проблема звонка в строке списка. */
export interface CallsListItemBadge {
    id: string;
    title: string;
    tone: CallsListBadgeTone;
}

/** Строка списка разборов. */
export interface CallsListItem {
    transcriptionId: string;
    /** Начало звонка, ISO. */
    startedAt: string;
    managerId: string | null;
    managerName: string | null;
    durationSec: number | null;
    callType: string | null;
    callTypeTitle: string | null;
    /** Оценка AI 1–10; null — оценки нет. */
    aiScore: number | null;
    client: string | null;
    reviews: CallsListReviews;
    /** Бейджи-проблемы звонка; старый бэк поля не присылает — считаем пустым. */
    badges?: CallsListItemBadge[];
    /** Страница разбора (личная ссылка руководителя); null — ссылки нет. */
    url: string | null;
}

export interface CallsListManagerFacet {
    id: string;
    name: string | null;
    count: number;
}

export interface CallsListCallTypeFacet {
    code: string;
    title: string | null;
    count: number;
}

/** Общий бейдж в панели: сколько разборов останется, если его добавить к выбору. */
export interface CallsListBadgeFacet {
    id: string;
    title: string;
    /** Пояснение при наведении. */
    hint: string;
    tone: CallsListBadgeTone;
    /** Бейджи одной семьи — альтернативы («или» на сервере); null — без семьи. */
    family: string | null;
    /** Показывать в панели по умолчанию. */
    main: boolean;
    /** С какой даты (YYYY-MM-DD) в разборах есть этот факт; null — всегда. */
    since: string | null;
    count: number;
}

/** Пункт методики в панели: сколько разборов с каждым состоянием. */
export interface CallsListPointFacet {
    code: string;
    /** Короткая подпись чипа. */
    label: string;
    /** Полное название пункта. */
    title: string;
    /** Типы звонка, к которым относится пункт. */
    callTypes: string[];
    main: boolean;
    done: number;
    missed: number;
}

/** Методика, по пунктам которой фильтруем. */
export interface CallsListMethodology {
    code: string;
    title: string;
}

export interface CallsListFacets {
    managers: CallsListManagerFacet[];
    callTypes: CallsListCallTypeFacet[];
    /** Общие бейджи; старый бэк поля не присылает — считаем пустым. */
    badges?: CallsListBadgeFacet[];
    /** Пункты методики; старый бэк поля не присылает — считаем пустым. */
    points?: CallsListPointFacet[];
    methodology?: CallsListMethodology | null;
}

/** Страница списка разборов. */
export interface CallsListResponse {
    items: CallsListItem[];
    /** Всего строк под фильтры (на всех страницах). */
    total: number;
    page: number;
    pageSize: number;
    facets: CallsListFacets;
    /**
     * Типы звонка, к которым относятся выбранные бейджи методики; null или
     * нет поля — без ограничения.
     */
    callTypesLock?: string[] | null;
}

/** Что не так с периодом: даты битые, начало позже конца или слишком длинный. */
export type CallsListPeriodProblem = 'invalid' | 'order' | 'too_long';

/** Ошибка загрузки: нет прав (раздел только руководителям) или сбой. */
export interface CallsListError {
    kind: 'forbidden' | 'error';
    message: string;
}
