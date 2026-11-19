/**
 * Черновик отзыва руководителя: согласен ли с оценкой AI, своя оценка,
 * общий комментарий и замечания «не так» к пунктам разбора. Чистый
 * редьюсер: пределы бэка соблюдаются здесь, на сохранение уходит готовое
 * тело. Пункт узнаётся по виду и ref — повторная отметка заменяет замечание.
 */
import type {
    CallReview,
    CallReviewItem,
    CallReviewSaveBody,
    CallReviewTarget,
} from '../model/types';
import { CALL_REVIEW_LIMITS as LIMITS } from './call-review.const';

export interface CallReviewDraft {
    /** null — ещё не ответил «Да» или «Нет». */
    agree: boolean | null;
    leaderScore: number | null;
    comment: string;
    items: CallReviewItem[];
}

export type CallReviewDraftAction =
    /** Начать заново с сохранённого отзыва (или с пустого). */
    | { type: 'reset'; review: CallReview | null }
    | { type: 'agree'; agree: boolean }
    | { type: 'score'; score: number | null }
    | { type: 'comment'; comment: string }
    /** Отметить «не так» или поменять замечание отмеченного пункта. */
    | { type: 'mark'; item: CallReviewItem }
    | { type: 'unmark'; target: Pick<CallReviewTarget, 'kind' | 'ref'> };

const clip = (text: string, max: number): string =>
    text.length > max ? text.slice(0, max) : text;

/** Оценка 1–10 целым; вне шкалы или не число — null. */
const normalizeScore = (score: number | null): number | null =>
    score !== null &&
    Number.isInteger(score) &&
    score >= LIMITS.scoreMin &&
    score <= LIMITS.scoreMax
        ? score
        : null;

const sameTarget = (
    a: Pick<CallReviewTarget, 'kind' | 'ref'>,
    b: Pick<CallReviewTarget, 'kind' | 'ref'>,
): boolean => a.kind === b.kind && a.ref === b.ref;

/** Пункт в пределах бэка. */
export const clipCallReviewItem = (item: CallReviewItem): CallReviewItem => ({
    kind: item.kind,
    ref: clip(item.ref, LIMITS.itemRef),
    label: clip(item.label, LIMITS.itemLabel),
    comment: clip(item.comment, LIMITS.itemComment),
});

/** Черновик из сохранённого отзыва; отзыва нет — пустой. */
export function callReviewDraftOf(review: CallReview | null): CallReviewDraft {
    if (!review) return { agree: null, leaderScore: null, comment: '', items: [] };
    return {
        agree: review.agree,
        leaderScore: normalizeScore(review.leaderScore),
        comment: clip(review.comment, LIMITS.comment),
        items: review.items.slice(0, LIMITS.items).map(clipCallReviewItem),
    };
}

/** Замечание к пункту в черновике; не отмечен — null. */
export function findCallReviewItem(
    draft: CallReviewDraft,
    target: Pick<CallReviewTarget, 'kind' | 'ref'>,
): CallReviewItem | null {
    return draft.items.find(item => sameTarget(item, target)) ?? null;
}

/** Можно ли отметить ещё один пункт (предел — 30). */
export const canAddCallReviewItem = (draft: CallReviewDraft): boolean =>
    draft.items.length < LIMITS.items;

function markItem(draft: CallReviewDraft, raw: CallReviewItem): CallReviewDraft {
    const item = clipCallReviewItem(raw);
    if (!item.ref.trim()) return draft;
    const index = draft.items.findIndex(current => sameTarget(current, item));
    if (index >= 0) {
        const items = [...draft.items];
        items[index] = item;
        return { ...draft, items };
    }
    return canAddCallReviewItem(draft)
        ? { ...draft, items: [...draft.items, item] }
        : draft;
}

export function callReviewDraftReducer(
    draft: CallReviewDraft,
    action: CallReviewDraftAction,
): CallReviewDraft {
    switch (action.type) {
        case 'reset':
            return callReviewDraftOf(action.review);
        case 'agree':
            return { ...draft, agree: action.agree };
        case 'score':
            return { ...draft, leaderScore: normalizeScore(action.score) };
        case 'comment':
            return { ...draft, comment: clip(action.comment, LIMITS.comment) };
        case 'mark':
            return markItem(draft, action.item);
        case 'unmark':
            return {
                ...draft,
                items: draft.items.filter(item => !sameTarget(item, action.target)),
            };
        default:
            return draft;
    }
}

/**
 * Тело сохранения: тексты без пробелов по краям. Не ответил «Согласны ли»
 * — сохранять нечего, null.
 */
export function callReviewBodyOf(draft: CallReviewDraft): CallReviewSaveBody | null {
    if (draft.agree === null) return null;
    return {
        agree: draft.agree,
        leaderScore: draft.leaderScore,
        items: draft.items.map(item => ({
            kind: item.kind,
            ref: item.ref.trim(),
            label: item.label.trim(),
            comment: item.comment.trim(),
        })),
        comment: draft.comment.trim(),
    };
}

/** Черновик отличается от сохранённого отзыва — есть что сохранять. */
export function isCallReviewDraftChanged(
    draft: CallReviewDraft,
    saved: CallReview | null,
): boolean {
    const body = callReviewBodyOf(draft);
    if (body === null) return false;
    const before = callReviewBodyOf(callReviewDraftOf(saved));
    return JSON.stringify(body) !== JSON.stringify(before);
}
