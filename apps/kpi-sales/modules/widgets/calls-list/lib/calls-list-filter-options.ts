/**
 * Варианты фильтров строки «Разборов звонков»: оценка AI от–до, отзывы,
 * порядок. Чистые данные и преобразования «значение селекта ↔ фильтр».
 */
import {
    CALLS_LIST_REVIEW_FILTERS,
    CALLS_LIST_REVIEW_FILTER_TEXT,
    CALLS_LIST_SCORE_RANGE,
    CALLS_LIST_SORTS,
    CALLS_LIST_SORT_TEXT,
    CALLS_LIST_TEXT,
    type CallsListReviewFilter,
    type CallsListSort,
} from '@/modules/entities/calls-list';

export interface CallsListSelectOption {
    value: string;
    label: string;
}

/** Значение селекта оценки «любая» — без границы. */
export const CALLS_LIST_SCORE_ANY = 'any';

const SCORE_OPTIONS: CallsListSelectOption[] = [
    { value: CALLS_LIST_SCORE_ANY, label: CALLS_LIST_TEXT.filters.scoreAny },
    ...Array.from(
        { length: CALLS_LIST_SCORE_RANGE.max - CALLS_LIST_SCORE_RANGE.min + 1 },
        (_, index) => {
            const score = String(CALLS_LIST_SCORE_RANGE.min + index);
            return { value: score, label: score };
        },
    ),
];

/**
 * Варианты оценки: «любая», 1…10. Граница из адреса бывает дробной (6.5) —
 * её в списке нет, добавляем в конец, чтобы селект её показал.
 */
export function callsListScoreOptions(current: number | null): CallsListSelectOption[] {
    if (current === null || SCORE_OPTIONS.some(option => option.value === String(current))) {
        return SCORE_OPTIONS;
    }
    return [
        ...SCORE_OPTIONS,
        { value: String(current), label: current.toLocaleString('ru-RU') },
    ];
}

export const scoreOptionValue = (score: number | null): string =>
    score === null ? CALLS_LIST_SCORE_ANY : String(score);

export function scoreOfOption(value: string): number | null {
    if (value === CALLS_LIST_SCORE_ANY) return null;
    const score = Number(value);
    return Number.isFinite(score) ? score : null;
}

export const CALLS_LIST_REVIEW_OPTIONS: CallsListSelectOption[] =
    CALLS_LIST_REVIEW_FILTERS.map(value => ({
        value,
        label: CALLS_LIST_REVIEW_FILTER_TEXT[value],
    }));

export const CALLS_LIST_SORT_OPTIONS: CallsListSelectOption[] = CALLS_LIST_SORTS.map(
    value => ({ value, label: CALLS_LIST_SORT_TEXT[value] }),
);

export const isCallsListReviewFilter = (value: string): value is CallsListReviewFilter =>
    (CALLS_LIST_REVIEW_FILTERS as readonly string[]).includes(value);

export const isCallsListSort = (value: string): value is CallsListSort =>
    (CALLS_LIST_SORTS as readonly string[]).includes(value);
