import { describe, expect, it } from 'vitest';
import { ANY_ITEM_KIND, type CallReviewsFilters } from '../model';
import {
    defaultReviewsPeriod,
    isValidReviewsPeriod,
    moscowDay,
    toCallReviewsQuery,
} from './call-reviews-query.util';

const filters = (fields: Partial<CallReviewsFilters> = {}): CallReviewsFilters => ({
    domain: 'gsr.bitrix24.ru',
    period: { from: '2026-10-21', to: '2026-11-19' },
    agree: 'all',
    itemKind: ANY_ITEM_KIND,
    ...fields,
});

describe('период и параметры списка отзывов', () => {
    it('день — по Москве: поздний вечер UTC уже завтра', () => {
        expect(moscowDay(new Date('2026-11-18T21:30:00.000Z'))).toBe('2026-11-19');
        expect(moscowDay(new Date('2026-11-18T20:30:00.000Z'))).toBe('2026-11-18');
    });

    it('по умолчанию — 30 дней, сегодня включительно', () => {
        expect(defaultReviewsPeriod(new Date('2026-11-19T09:00:00.000Z'), 30)).toEqual({
            from: '2026-10-21',
            to: '2026-11-19',
        });
    });

    it('период проверяется: даты настоящие, начало не позже конца', () => {
        expect(isValidReviewsPeriod({ from: '2026-11-01', to: '2026-11-19' })).toBe(true);
        expect(isValidReviewsPeriod({ from: '2026-11-19', to: '2026-11-01' })).toBe(false);
        expect(isValidReviewsPeriod({ from: '2026-02-30', to: '2026-03-01' })).toBe(false);
        expect(isValidReviewsPeriod({ from: '', to: '2026-03-01' })).toBe(false);
    });

    it('«все» и «любое» в запрос не идут, выбранные фильтры — идут', () => {
        expect(toCallReviewsQuery(filters(), 1, 50)).toEqual({
            domain: 'gsr.bitrix24.ru',
            from: '2026-10-21',
            to: '2026-11-19',
            page: 1,
            pageSize: 50,
        });
        expect(toCallReviewsQuery(filters({ agree: 'no', itemKind: 'methodology' }), 3, 50)).toMatchObject({
            page: 3,
            agree: 'no',
            itemKind: 'methodology',
        });
    });

    it('портал не выбран или период неверный — запроса нет', () => {
        expect(toCallReviewsQuery(filters({ domain: undefined }), 1, 50)).toBeNull();
        expect(
            toCallReviewsQuery(filters({ period: { from: '2026-11-19', to: '2026-11-01' } }), 1, 50),
        ).toBeNull();
    });
});
