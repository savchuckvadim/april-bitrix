import { describe, expect, it } from 'vitest';
import {
    CALLS_LIST_DEBOUNCE_MS,
    defaultCallsListQuery,
    isCallsListRequestImmediate,
    patchCallsListQuery,
    type CallsListQuery,
} from '..';

const TODAY = new Date(2026, 10, 19, 15, 30);

const base = (): CallsListQuery => defaultCallsListQuery(TODAY);

describe('calls-list-timing — сразу или после паузы', () => {
    it('пауза перед запросом — 350 мс', () => {
        expect(CALLS_LIST_DEBOUNCE_MS).toBe(350);
    });

    it('первая загрузка — сразу', () => {
        expect(isCallsListRequestImmediate(null, base())).toBe(true);
    });

    it('смена страницы и размера страницы — сразу', () => {
        const previous = { ...base(), page: 2 };
        expect(isCallsListRequestImmediate(previous, { ...previous, page: 3 })).toBe(true);
        expect(
            isCallsListRequestImmediate(previous, patchCallsListQuery(previous, { pageSize: 100 })),
        ).toBe(true);
    });

    it('тот же запрос — сразу (нечего ждать)', () => {
        expect(isCallsListRequestImmediate(base(), { ...base() })).toBe(true);
    });

    it.each<[string, Partial<CallsListQuery>]>([
        ['период', { from: '2026-09-01' }],
        ['сотрудники', { managerIds: ['447'] }],
        ['типы звонка', { callTypes: ['cold'] }],
        ['бейджи', { badges: ['no_price'] }],
        ['пункты методики', { points: [{ code: 'greeting', state: 'missed' }] }],
        ['оценка от', { scoreMin: 3 }],
        ['оценка до', { scoreMax: 8 }],
        ['отзывы', { review: 'reviewed' }],
        ['порядок', { sort: 'score_asc' }],
    ])('правка фильтра «%s» — после паузы', (_name, patch) => {
        expect(isCallsListRequestImmediate(base(), { ...base(), ...patch })).toBe(false);
    });

    it('фильтр сменился вместе со страницей (сброс на первую) — всё равно после паузы', () => {
        const onThird = { ...base(), page: 3 };
        expect(
            isCallsListRequestImmediate(onThird, patchCallsListQuery(onThird, { badges: ['a'] })),
        ).toBe(false);
    });
});
