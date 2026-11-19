import type { CallReviewSaveBody, CallReviewSaveResult } from '../../model/types';
import { callReviewSaveUrl } from '../call-review.const';
import { callReviewErrorText } from '../call-review-error';
import { isCallReviewView } from '../call-review-guard';
import { CALL_REVIEW_TEXT } from '../call-review.texts';

/** Ответ нашего route handler → итог сохранения. Чистая функция. */
export function callReviewSaveResultOf(
    status: number,
    payload: unknown,
): CallReviewSaveResult {
    if (status >= 200 && status < 300) {
        return isCallReviewView(payload)
            ? { ok: true, view: payload }
            : { ok: false, message: CALL_REVIEW_TEXT.errors.saveFailed };
    }
    return { ok: false, message: callReviewErrorText(payload, status) };
}

/**
 * Сохранить отзыв: браузер ходит только на наш сайт
 * (`/api/call/<ключ>/lead/<личный ключ>/review`), адрес бэкенда не виден.
 */
export async function saveCallReview(
    token: string,
    lead: string,
    body: CallReviewSaveBody,
): Promise<CallReviewSaveResult> {
    try {
        const response = await fetch(callReviewSaveUrl(token, lead), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store',
        });
        const payload: unknown = await response.json().catch(() => null);
        return callReviewSaveResultOf(response.status, payload);
    } catch {
        return { ok: false, message: CALL_REVIEW_TEXT.errors.saveFailed };
    }
}
