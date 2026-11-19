/**
 * Проверка формы ответа ручек отзыва: сервер Next и браузер верят только
 * тому, что похоже на блок «Оценка руководителя».
 */
import {
    CALL_REVIEW_AUTHOR_ROLES,
    CALL_REVIEW_ITEM_KINDS,
    type CallReview,
    type CallReviewItem,
    type CallReviewView,
    type CallReviewViewer,
} from '../model/types';

type Shape = Record<string, unknown>;

const isShape = (value: unknown): value is Shape =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const isOneOf = (values: readonly string[], value: unknown): boolean =>
    typeof value === 'string' && values.includes(value);

const isScore = (value: unknown): boolean =>
    value === null || typeof value === 'number';

const isItem = (value: unknown): value is CallReviewItem =>
    isShape(value) &&
    isOneOf(CALL_REVIEW_ITEM_KINDS, value.kind) &&
    typeof value.ref === 'string' &&
    typeof value.label === 'string' &&
    typeof value.comment === 'string';

export const isCallReview = (value: unknown): value is CallReview =>
    isShape(value) &&
    typeof value.authorName === 'string' &&
    isOneOf(CALL_REVIEW_AUTHOR_ROLES, value.authorRole) &&
    typeof value.agree === 'boolean' &&
    isScore(value.leaderScore) &&
    isScore(value.aiScore) &&
    Array.isArray(value.items) &&
    value.items.every(isItem) &&
    typeof value.comment === 'string' &&
    typeof value.createdAt === 'string';

const isViewer = (value: unknown): value is CallReviewViewer =>
    isShape(value) &&
    (value.name === null || typeof value.name === 'string') &&
    isOneOf(CALL_REVIEW_AUTHOR_ROLES, value.role) &&
    typeof value.canReview === 'boolean' &&
    typeof value.expiresAt === 'string';

export const isCallReviewView = (value: unknown): value is CallReviewView =>
    isShape(value) &&
    isViewer(value.viewer) &&
    (value.mine === null || isCallReview(value.mine)) &&
    Array.isArray(value.colleagues) &&
    value.colleagues.every(isCallReview);
