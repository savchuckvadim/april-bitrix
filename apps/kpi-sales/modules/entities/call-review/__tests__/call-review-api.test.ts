import { describe, expect, it } from 'vitest';
import {
    CALL_REVIEW_KIND_TEXT,
    CALL_REVIEW_ROLE_TEXT,
    CALL_REVIEW_TEXT,
    callReviewCounter,
    callReviewErrorText,
    callReviewSaveResultOf,
    callReviewSaveUrl,
    callReviewTextPreview,
    formatCallReviewMoment,
    isCallReviewTextLong,
    isCallReviewView,
    type CallReviewView,
} from '..';

const VIEW: CallReviewView = {
    viewer: {
        name: 'Петров Пётр',
        role: 'leader',
        canReview: true,
        expiresAt: '2026-11-26T08:00:00.000Z',
    },
    mine: null,
    colleagues: [
        {
            authorName: 'Сидорова Анна',
            authorRole: 'superuser',
            agree: true,
            leaderScore: null,
            aiScore: 6.4,
            items: [{ kind: 'call_type', ref: 'Холодный', label: 'Тип звонка: Холодный', comment: '' }],
            comment: '',
            createdAt: '2026-11-19T08:15:00.000Z',
        },
    ],
};

/* Правило владельца: тексты для людей — по-русски, без кодов. */
const FORBIDDEN = /[a-z]{3,}|_|админк/;

const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (typeof value === 'function') return [];
    if (value && typeof value === 'object') return Object.values(value).flatMap(flatten);
    return [];
};

describe('call-review — ответы ручек и ошибки', () => {
    it('форма ответа: настоящий блок проходит, кривой — нет', () => {
        expect(isCallReviewView(VIEW)).toBe(true);
        expect(isCallReviewView({ ...VIEW, viewer: { ...VIEW.viewer, role: 'manager' } })).toBe(false);
        expect(
            isCallReviewView({
                ...VIEW,
                colleagues: [{ ...VIEW.colleagues[0], items: [{ kind: 'other', ref: 'x', label: '', comment: '' }] }],
            }),
        ).toBe(false);
        expect(isCallReviewView({ resultCode: 0, data: VIEW })).toBe(false);
        expect(isCallReviewView(null)).toBe(false);
    });

    it('текст ошибки: понятный текст сервера как есть, служебный — по статусу', () => {
        expect(
            callReviewErrorText({ message: 'Срок ссылки истёк — откройте разбор из отчёта KPI заново' }, 410),
        ).toBe('Срок ссылки истёк — откройте разбор из отчёта KPI заново');
        expect(callReviewErrorText({ message: 'Validation failed' }, 400)).toBe(
            CALL_REVIEW_TEXT.errors.saveFailed,
        );
        expect(callReviewErrorText(null, 404)).toBe('Ссылка недействительна');
        expect(callReviewErrorText({ message: 'Too Many Requests' }, 429)).toBe(
            CALL_REVIEW_TEXT.errors.tooOften,
        );
        expect(callReviewErrorText({ message: ['Оценка — от 1 до 10', 'x'] }, 400)).toBe(
            'Оценка — от 1 до 10; x',
        );
        expect(callReviewErrorText(undefined, null, 'запасной')).toBe('запасной');
    });

    it('итог сохранения: блок отзывов или текст ошибки', () => {
        expect(callReviewSaveResultOf(200, VIEW)).toEqual({ ok: true, view: VIEW });
        expect(callReviewSaveResultOf(200, { strange: true })).toEqual({
            ok: false,
            message: CALL_REVIEW_TEXT.errors.saveFailed,
        });
        expect(
            callReviewSaveResultOf(403, { message: 'Оставить отзыв может руководитель этого сотрудника' }),
        ).toEqual({ ok: false, message: 'Оставить отзыв может руководитель этого сотрудника' });
    });

    it('адрес сохранения — наш сайт, ключи экранируются', () => {
        expect(callReviewSaveUrl('a/b', 'x.y')).toBe('/api/call/a%2Fb/lead/x.y/review');
    });
});

describe('call-review-format — вид блока', () => {
    it('дата отзыва — по Москве с пометкой', () => {
        expect(formatCallReviewMoment('2026-11-19T08:15:00.000Z')).toBe('19 ноября, 11:15 МСК');
        expect(formatCallReviewMoment('вчера')).toBeNull();
    });

    it('счётчик знаков — только ближе к пределу', () => {
        expect(callReviewCounter(100, 20_000)).toBeNull();
        expect(callReviewCounter(18_500, 20_000)).toBe('18 500 из 20 000 знаков');
    });

    it('длинный комментарий сворачивается по границе слова', () => {
        const long = 'слово '.repeat(200);
        expect(isCallReviewTextLong(long)).toBe(true);
        const preview = callReviewTextPreview(long);
        expect(preview.endsWith('слово…')).toBe(true);
        expect(preview.length).toBeLessThanOrEqual(601);
        expect(callReviewTextPreview('коротко')).toBe('коротко');
    });

    it('тексты блока — по-русски, без кодов', () => {
        for (const text of [
            ...flatten(CALL_REVIEW_TEXT),
            ...flatten(CALL_REVIEW_ROLE_TEXT),
            ...flatten(CALL_REVIEW_KIND_TEXT),
        ]) {
            expect(text.replace('KPI', '')).not.toMatch(FORBIDDEN);
        }
        expect(CALL_REVIEW_TEXT.agree.question('6,4')).toBe('Согласны с оценкой AI (6,4 из 10)?');
    });
});
