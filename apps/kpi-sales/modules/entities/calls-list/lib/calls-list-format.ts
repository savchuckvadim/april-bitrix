/**
 * Вид строк списка разборов: дата, сводка отзывов руководителей, варианты
 * фильтров из фасетов, ссылка на разбор с пометкой «пришли из списка».
 * Чистые функции.
 */
import { formatScore } from '@/modules/entities/call-page/lib/call-page-format';
import { pluralRu } from '@/modules/entities/ai-analytics/lib/ai-readiness.data';
import type {
    CallsListCallTypeFacet,
    CallsListManagerFacet,
    CallsListReviews,
} from '../model/types';
import { CALL_PAGE_FROM_CALLS, CALL_PAGE_FROM_PARAM } from './calls-list.const';
import { CALLS_LIST_TEXT } from './calls-list.texts';

const T = CALLS_LIST_TEXT;

const REVIEW_FORMS = ['отзыв', 'отзыва', 'отзывов'] as const;

const MOMENT = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

/** Начало звонка «18.11.2026, 10:42» по часам браузера; битая дата — «—». */
export function formatCallsListMoment(iso: string | null | undefined): string {
    if (!iso) return T.table.noValue;
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? T.table.noValue : MOMENT.format(date);
}

/** Сводка отзывов строки: сколько, мой, несогласие, средняя оценка. */
export interface CallsListReviewsView {
    /** «2 отзыва» или «не оценён». */
    count: string;
    /** «мой: 7, согласен» / «моего нет»; отзывов нет — null. */
    mine: string | null;
    /** Пометка несогласия с оценкой AI; несогласных нет — null. */
    disagree: string | null;
    /** «средняя оценка руководителей 6,5»; оценок нет — null. */
    average: string | null;
}

export function callsListReviewsView(reviews: CallsListReviews): CallsListReviewsView {
    if (reviews.count <= 0) {
        return { count: T.reviews.none, mine: null, disagree: null, average: null };
    }
    const mine = reviews.mine;
    const mineText = mine
        ? `мой: ${mine.leaderScore === null ? '' : `${formatScore(mine.leaderScore)}, `}${
              mine.agree ? T.reviews.agree : T.reviews.disagree
          }`
        : T.reviews.mineNone;
    return {
        count: `${reviews.count} ${pluralRu(reviews.count, REVIEW_FORMS)}`,
        mine: mineText,
        disagree:
            reviews.disagreeCount > 0
                ? T.reviews.disagreeMark(reviews.disagreeCount)
                : null,
        average:
            reviews.avgLeaderScore === null
                ? null
                : `${T.reviews.average} ${formatScore(reviews.avgLeaderScore)}`,
    };
}

/** Вариант фильтра: значение, подпись и число разборов справа. */
export interface CallsListFilterOption {
    value: string;
    label: string;
    hint: string;
}

const countHint = (count: number): string => count.toLocaleString('ru-RU');

export const callsListManagerOptions = (
    facets: readonly CallsListManagerFacet[],
): CallsListFilterOption[] =>
    facets.map(facet => ({
        value: facet.id,
        label: facet.name ?? T.filters.noManagerName,
        hint: countHint(facet.count),
    }));

export const callsListTypeOptions = (
    facets: readonly CallsListCallTypeFacet[],
): CallsListFilterOption[] =>
    facets.map(facet => ({
        value: facet.code,
        label: facet.title ?? T.filters.noTypeTitle,
        hint: countHint(facet.count),
    }));

/**
 * Ссылка строки на разбор с пометкой `?from=calls` — на странице разбора
 * появится «← К списку разборов». Нет ссылки — null.
 */
export function callsListRowHref(url: string | null | undefined): string | null {
    if (!url) return null;
    const [beforeHash, hash] = url.split('#', 2);
    const separator = (beforeHash ?? '').includes('?') ? '&' : '?';
    const marked = `${beforeHash}${separator}${CALL_PAGE_FROM_PARAM}=${CALL_PAGE_FROM_CALLS}`;
    return hash === undefined ? marked : `${marked}#${hash}`;
}

/** Страницу звонка открыли из списка разборов (`?from=calls`). */
export const isFromCallsList = (
    value: string | string[] | null | undefined,
): boolean =>
    Array.isArray(value)
        ? value.includes(CALL_PAGE_FROM_CALLS)
        : value === CALL_PAGE_FROM_CALLS;
