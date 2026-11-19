import { describe, expect, it } from 'vitest';
import {
    CALLS_LIST_PERIOD_PROBLEM_TEXT,
    CALLS_LIST_REVIEW_FILTER_TEXT,
    CALLS_LIST_SORT_TEXT,
    CALLS_LIST_TEXT,
    callsListErrorOf,
    callsListManagerOptions,
    callsListPeriodDays,
    callsListPeriodProblem,
    callsListReviewsView,
    callsListRowHref,
    callsListTypeOptions,
    formatCallsListMoment,
    isFromCallsList,
    parseIsoDay,
    type CallsListReviews,
} from '..';

const reviews = (patch: Partial<CallsListReviews> = {}): CallsListReviews => ({
    count: 0,
    disagreeCount: 0,
    avgLeaderScore: null,
    mine: null,
    lastAt: null,
    ...patch,
});

/* Правило владельца: тексты для людей — по-русски, без кодов. */
const FORBIDDEN = /[a-z]{3,}|_|админк/;

const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [];
    if (value && typeof value === 'object') return Object.values(value).flatMap(flatten);
    return [];
};

describe('calls-list-period — период списка', () => {
    it('даты: только настоящие дни вида ГГГГ-ММ-ДД', () => {
        expect(parseIsoDay('2026-11-19')).not.toBeNull();
        expect(parseIsoDay('2026-02-30')).toBeNull();
        expect(parseIsoDay('19.11.2026')).toBeNull();
        expect(parseIsoDay(null)).toBeNull();
    });

    it('длина периода включает обе даты; предел — 92 дня', () => {
        expect(callsListPeriodDays('2026-11-19', '2026-11-19')).toBe(1);
        expect(callsListPeriodProblem('2026-08-20', '2026-11-19')).toBeNull();
        expect(callsListPeriodProblem('2026-08-19', '2026-11-19')).toBe('too_long');
        expect(callsListPeriodProblem('2026-11-20', '2026-11-19')).toBe('order');
        expect(callsListPeriodProblem('', '2026-11-19')).toBe('invalid');
    });
});

describe('calls-list-format — вид строк', () => {
    it('дата звонка «дд.мм.гггг, чч:мм»; нет даты — прочерк', () => {
        expect(formatCallsListMoment(new Date(2026, 10, 18, 10, 42).toISOString())).toBe(
            '18.11.2026, 10:42',
        );
        expect(formatCallsListMoment(null)).toBe('—');
        expect(formatCallsListMoment('вчера')).toBe('—');
    });

    it('отзывов нет — «не оценён»', () => {
        expect(callsListReviewsView(reviews())).toEqual({
            count: 'не оценён',
            mine: null,
            disagree: null,
            average: null,
        });
    });

    it('мой отзыв с оценкой, несогласие коллеги и средняя оценка', () => {
        expect(
            callsListReviewsView(
                reviews({
                    count: 2,
                    disagreeCount: 1,
                    avgLeaderScore: 6.5,
                    mine: { leaderScore: 7, agree: true },
                }),
            ),
        ).toEqual({
            count: '2 отзыва',
            mine: 'мой: 7, согласен',
            disagree: 'есть несогласие',
            average: 'средняя оценка руководителей 6,5',
        });
    });

    it('мой отзыв без оценки; моего нет; несколько несогласных', () => {
        expect(
            callsListReviewsView(reviews({ count: 1, mine: { leaderScore: null, agree: false } }))
                .mine,
        ).toBe('мой: не согласен');
        const others = callsListReviewsView(reviews({ count: 5, disagreeCount: 3 }));
        expect(others.count).toBe('5 отзывов');
        expect(others.mine).toBe('моего нет');
        expect(others.disagree).toBe('несогласны: 3');
    });

    it('варианты фильтров из фасетов: подпись и число разборов, без имени — запасная подпись', () => {
        expect(
            callsListManagerOptions([
                { id: '447', name: 'Иванова Мария', count: 1234 },
                { id: '512', name: null, count: 2 },
            ]),
        ).toEqual([
            { value: '447', label: 'Иванова Мария', hint: '1 234' },
            { value: '512', label: 'Сотрудник без имени', hint: '2' },
        ]);
        expect(callsListTypeOptions([{ code: 'cold', title: null, count: 3 }])).toEqual([
            { value: 'cold', label: 'Тип без названия', hint: '3' },
        ]);
    });

    it('ссылка строки — с пометкой «из списка»; нет ссылки — null', () => {
        expect(callsListRowHref('https://next.april-app.ru/call/abc/lead/x.y')).toBe(
            'https://next.april-app.ru/call/abc/lead/x.y?from=calls',
        );
        expect(callsListRowHref('/call/abc?x=1#top')).toBe('/call/abc?x=1&from=calls#top');
        expect(callsListRowHref(null)).toBeNull();
        expect(isFromCallsList('calls')).toBe(true);
        expect(isFromCallsList(['x', 'calls'])).toBe(true);
        expect(isFromCallsList(undefined)).toBe(false);
    });

    it('ошибки: 403 — текст сервера «только руководителям», сбой — понятный текст', () => {
        const forbidden = {
            response: { status: 403, data: { message: 'Раздел доступен руководителям' } },
        };
        expect(callsListErrorOf(forbidden)).toEqual({
            kind: 'forbidden',
            message: 'Раздел доступен руководителям',
        });
        expect(callsListErrorOf({ response: { status: 403, data: {} } }).message).toBe(
            CALLS_LIST_TEXT.states.forbiddenTitle,
        );
        expect(callsListErrorOf(new Error('Network Error'))).toEqual({
            kind: 'error',
            message: CALLS_LIST_TEXT.states.errorFallback,
        });
    });

    it('тексты раздела — по-русски, без кодов', () => {
        for (const text of [
            ...flatten(CALLS_LIST_TEXT),
            ...flatten(CALLS_LIST_PERIOD_PROBLEM_TEXT),
            ...flatten(CALLS_LIST_REVIEW_FILTER_TEXT),
            ...flatten(CALLS_LIST_SORT_TEXT),
        ]) {
            expect(text.replace('AI', '')).not.toMatch(FORBIDDEN);
        }
    });
});
