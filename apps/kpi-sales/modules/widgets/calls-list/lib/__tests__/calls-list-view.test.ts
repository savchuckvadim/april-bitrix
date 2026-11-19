import { describe, expect, it } from 'vitest';
import type { CallsListResponse } from '@/modules/entities/calls-list';
import {
    CALLS_LIST_REVIEW_OPTIONS,
    CALLS_LIST_SORT_OPTIONS,
    callsListScoreOptions,
    isCallsListReviewFilter,
    isCallsListSort,
    scoreOfOption,
    scoreOptionValue,
} from '../calls-list-filter-options';
import { callsListViewOf } from '../calls-list-view';

const page = (total: number): CallsListResponse => ({
    items: [],
    total,
    page: 1,
    pageSize: 25,
    facets: { managers: [], callTypes: [] },
});

describe('callsListViewOf — что показать под фильтрами', () => {
    it('нет доступа главнее всего', () => {
        expect(
            callsListViewOf({
                periodInvalid: true,
                error: { kind: 'forbidden', message: 'Раздел доступен руководителям' },
                data: null,
            }),
        ).toBe('forbidden');
    });

    it('период с ошибкой — без таблицы, даже если старая страница есть', () => {
        expect(callsListViewOf({ periodInvalid: true, error: null, data: page(10) })).toBe(
            'period',
        );
    });

    it('сбой, первая загрузка, пусто, таблица', () => {
        expect(
            callsListViewOf({
                periodInvalid: false,
                error: { kind: 'error', message: 'Не удалось' },
                data: page(10),
            }),
        ).toBe('error');
        expect(callsListViewOf({ periodInvalid: false, error: null, data: null })).toBe('loading');
        expect(callsListViewOf({ periodInvalid: false, error: null, data: page(0) })).toBe('empty');
        expect(callsListViewOf({ periodInvalid: false, error: null, data: page(3) })).toBe('table');
    });
});

describe('calls-list-filter-options — варианты фильтров', () => {
    it('оценка: «любая» и 1–10; дробная граница из адреса добавляется', () => {
        expect(callsListScoreOptions(null).map(option => option.value)).toEqual([
            'any', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
        ]);
        expect(callsListScoreOptions(7)).toHaveLength(11);
        const withHalf = callsListScoreOptions(6.5);
        expect(withHalf[withHalf.length - 1]).toEqual({ value: '6.5', label: '6,5' });
        expect(scoreOptionValue(null)).toBe('any');
        expect(scoreOfOption('any')).toBeNull();
        expect(scoreOfOption('6.5')).toBe(6.5);
        expect(scoreOfOption('x')).toBeNull();
    });

    it('отзывы и порядок — все значения бэка с подписями', () => {
        expect(CALLS_LIST_REVIEW_OPTIONS.map(option => option.label)).toEqual([
            'Все',
            'С отзывом',
            'Без отзыва',
            'Есть несогласие',
        ]);
        expect(CALLS_LIST_SORT_OPTIONS.map(option => option.value)).toEqual([
            'date_desc',
            'date_asc',
            'score_asc',
            'score_desc',
        ]);
        expect(isCallsListReviewFilter('disagreed')).toBe(true);
        expect(isCallsListReviewFilter('all')).toBe(false);
        expect(isCallsListSort('score_desc')).toBe(true);
        expect(isCallsListSort('random')).toBe(false);
    });
});
