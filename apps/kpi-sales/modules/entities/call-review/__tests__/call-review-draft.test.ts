import { describe, expect, it } from 'vitest';
import {
    CALL_REVIEW_LIMITS,
    callReviewBodyOf,
    callReviewDraftOf,
    callReviewDraftReducer,
    canAddCallReviewItem,
    findCallReviewItem,
    isCallReviewDraftChanged,
    type CallReview,
    type CallReviewDraft,
    type CallReviewDraftAction,
    type CallReviewItem,
} from '..';

const item = (patch: Partial<CallReviewItem> = {}): CallReviewItem => ({
    kind: 'section',
    ref: 'Выяснение потребностей',
    label: 'Выяснение потребностей',
    comment: 'Потребность клиент назвал сам',
    ...patch,
});

const saved: CallReview = {
    authorName: 'Петров Пётр',
    authorRole: 'leader',
    agree: false,
    leaderScore: 5,
    aiScore: 6.4,
    items: [item()],
    comment: 'Оценка завышена',
    createdAt: '2026-11-19T08:15:00.000Z',
};

const run = (
    actions: CallReviewDraftAction[],
    start: CallReviewDraft = callReviewDraftOf(null),
): CallReviewDraft => actions.reduce(callReviewDraftReducer, start);

describe('call-review-draft — черновик отзыва руководителя', () => {
    it('пустой черновик: ответа «согласен ли» нет, сохранять нечего', () => {
        const draft = callReviewDraftOf(null);
        expect(draft).toEqual({ agree: null, leaderScore: null, comment: '', items: [] });
        expect(callReviewBodyOf(draft)).toBeNull();
        expect(isCallReviewDraftChanged(draft, null)).toBe(false);
    });

    it('черновик из сохранённого отзыва и сброс к нему', () => {
        const draft = callReviewDraftOf(saved);
        expect(draft).toEqual({
            agree: false,
            leaderScore: 5,
            comment: 'Оценка завышена',
            items: [item()],
        });
        const edited = run([{ type: 'agree', agree: true }, { type: 'comment', comment: 'x' }], draft);
        expect(isCallReviewDraftChanged(edited, saved)).toBe(true);
        expect(run([{ type: 'reset', review: saved }], edited)).toEqual(draft);
        expect(isCallReviewDraftChanged(draft, saved)).toBe(false);
    });

    it('оценка — целое 1–10, иначе без оценки', () => {
        expect(run([{ type: 'score', score: 7 }]).leaderScore).toBe(7);
        expect(run([{ type: 'score', score: 0 }]).leaderScore).toBeNull();
        expect(run([{ type: 'score', score: 11 }]).leaderScore).toBeNull();
        expect(run([{ type: 'score', score: 6.5 }]).leaderScore).toBeNull();
        expect(run([{ type: 'score', score: 7 }, { type: 'score', score: null }]).leaderScore).toBeNull();
    });

    it('комментарий режется по пределу 20 000 знаков', () => {
        const long = 'а'.repeat(CALL_REVIEW_LIMITS.comment + 50);
        expect(run([{ type: 'comment', comment: long }]).comment).toHaveLength(
            CALL_REVIEW_LIMITS.comment,
        );
    });

    it('«не так»: отметить, заменить замечание того же пункта, убрать', () => {
        const marked = run([{ type: 'mark', item: item() }]);
        expect(findCallReviewItem(marked, { kind: 'section', ref: 'Выяснение потребностей' })).toEqual(item());
        expect(findCallReviewItem(marked, { kind: 'objection', ref: 'Выяснение потребностей' })).toBeNull();

        const changed = run([{ type: 'mark', item: item({ comment: 'Иначе' }) }], marked);
        expect(changed.items).toEqual([item({ comment: 'Иначе' })]);

        const removed = run(
            [{ type: 'unmark', target: { kind: 'section', ref: 'Выяснение потребностей' } }],
            changed,
        );
        expect(removed.items).toEqual([]);
    });

    it('«не так»: длинные поля режутся по пределам, пункт без ref не добавляется', () => {
        const draft = run([
            {
                type: 'mark',
                item: item({
                    ref: 'р'.repeat(250),
                    label: 'п'.repeat(350),
                    comment: 'к'.repeat(2100),
                }),
            },
            { type: 'mark', item: item({ ref: '   ' }) },
        ]);
        expect(draft.items).toHaveLength(1);
        expect(draft.items[0]?.ref).toHaveLength(CALL_REVIEW_LIMITS.itemRef);
        expect(draft.items[0]?.label).toHaveLength(CALL_REVIEW_LIMITS.itemLabel);
        expect(draft.items[0]?.comment).toHaveLength(CALL_REVIEW_LIMITS.itemComment);
    });

    it('не больше 30 пунктов: тридцать первый не добавляется, но замена отмеченного работает', () => {
        const full = run(
            Array.from({ length: CALL_REVIEW_LIMITS.items }, (_, index) => ({
                type: 'mark' as const,
                item: item({ ref: `Раздел ${index}` }),
            })),
        );
        expect(full.items).toHaveLength(30);
        expect(canAddCallReviewItem(full)).toBe(false);
        expect(run([{ type: 'mark', item: item({ ref: 'Лишний' }) }], full).items).toHaveLength(30);
        const replaced = run([{ type: 'mark', item: item({ ref: 'Раздел 0', comment: 'Новое' }) }], full);
        expect(replaced.items[0]?.comment).toBe('Новое');
    });

    it('тело сохранения: тексты без пробелов по краям', () => {
        const draft = run([
            { type: 'agree', agree: true },
            { type: 'score', score: 8 },
            { type: 'comment', comment: '  Всё верно  ' },
            { type: 'mark', item: item({ comment: '  тип не тот ' }) },
        ]);
        expect(callReviewBodyOf(draft)).toEqual({
            agree: true,
            leaderScore: 8,
            comment: 'Всё верно',
            items: [item({ comment: 'тип не тот' })],
        });
    });
});
