/**
 * Пределы отзыва — как у бэка (AI_ANALYTICS_CALL_REVIEW_LIMITS): больше не
 * примет валидация, поэтому поля режутся ещё на странице.
 */
export const CALL_REVIEW_LIMITS = {
    /** Пунктов «не так» в одном отзыве. */
    items: 30,
    itemRef: 200,
    itemLabel: 300,
    itemComment: 2000,
    /** Общий комментарий — «целый рассказ». */
    comment: 20_000,
    scoreMin: 1,
    scoreMax: 10,
} as const;

/** Счётчик знаков показывается, когда текст занял столько от предела. */
export const CALL_REVIEW_COUNTER_FROM = 0.8;

/** Комментарий коллеги длиннее — свёрнут с «Показать полностью». */
export const CALL_REVIEW_COLLAPSE_AFTER = 600;

/** Адрес сохранения на нашем сайте (route handler Next, не бэкенд). */
export const callReviewSaveUrl = (token: string, lead: string): string =>
    `/api/call/${encodeURIComponent(token)}/lead/${encodeURIComponent(lead)}/review`;
