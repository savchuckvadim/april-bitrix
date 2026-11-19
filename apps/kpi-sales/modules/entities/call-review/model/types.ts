/**
 * Отзыв руководителя о разборе звонка (личная страница `/call/<ключ
 * звонка>/lead/<личный ключ>`). Клиента ручек ещё не сгенерировали — типы
 * руками по DTO бэка (call-page/dto/call-page-lead.dto.ts).
 */

/** К чему замечание «не так»: раздел, возражение, пункт методики, факт, тип звонка. */
export const CALL_REVIEW_ITEM_KINDS = [
    'section',
    'objection',
    'methodology',
    'fact',
    'call_type',
] as const;
export type CallReviewItemKind = (typeof CALL_REVIEW_ITEM_KINDS)[number];

/** Кто автор отзыва: руководитель отдела или команда сервиса. */
export const CALL_REVIEW_AUTHOR_ROLES = ['leader', 'superuser'] as const;
export type CallReviewAuthorRole = (typeof CALL_REVIEW_AUTHOR_ROLES)[number];

/** Пункт разбора, к которому можно оставить замечание. */
export interface CallReviewTarget {
    kind: CallReviewItemKind;
    /** Чей пункт — название раздела, возражения, пункта методики. */
    ref: string;
    /** Подпись пункта, как её видит руководитель. */
    label: string;
}

/** Замечание «не так» к пункту разбора. */
export interface CallReviewItem extends CallReviewTarget {
    comment: string;
}

/** Отзыв руководителя, как его отдаёт бэк. */
export interface CallReview {
    authorName: string;
    authorRole: CallReviewAuthorRole;
    agree: boolean;
    /** Оценка автора 1–10; null — не ставил. */
    leaderScore: number | null;
    /** Оценка AI на момент отзыва; null — не было. */
    aiScore: number | null;
    items: CallReviewItem[];
    comment: string;
    /** Когда оставлен, ISO. */
    createdAt: string;
}

/** Кто открыл личную страницу и что ему можно. */
export interface CallReviewViewer {
    name: string | null;
    role: CallReviewAuthorRole;
    /** Можно ли сейчас оставить отзыв (бэк перепроверяет по структуре). */
    canReview: boolean;
    /** До какого момента действует личная ссылка, ISO. */
    expiresAt: string;
}

/** Блок «Оценка руководителя»: зритель, его отзыв и отзывы коллег. */
export interface CallReviewView {
    viewer: CallReviewViewer;
    mine: CallReview | null;
    colleagues: CallReview[];
}

/** Что уходит на сохранение. */
export interface CallReviewSaveBody {
    agree: boolean;
    leaderScore: number | null;
    items: CallReviewItem[];
    comment: string;
}

/**
 * Чем закончилась загрузка блока на сервере Next: данные или текст, почему
 * блока нет (ссылка недействительна, срок истёк, сбой) — страница звонка при
 * этом показывается как обычная.
 */
export type CallReviewLoad =
    | { status: 'ok'; view: CallReviewView }
    | { status: 'unavailable'; message: string };

/** Итог сохранения отзыва в браузере. */
export type CallReviewSaveResult =
    | { ok: true; view: CallReviewView }
    | { ok: false; message: string };
