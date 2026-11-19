/**
 * Вид блока «Оценка руководителя»: дата отзыва, счётчик знаков ближе к
 * пределу, свёртка длинного комментария. Чистые функции.
 */
import { CALL_REVIEW_COLLAPSE_AFTER, CALL_REVIEW_COUNTER_FROM } from './call-review.const';
import { CALL_REVIEW_TEXT } from './call-review.texts';

const DAY = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: 'numeric',
    month: 'long',
});

const TIME = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    hour: '2-digit',
    minute: '2-digit',
});

/**
 * «19 ноября, 11:15 МСК». По Москве, как дата звонка на странице: страница
 * рисуется и на сервере, и в браузере — часовой пояс не должен менять текст.
 */
export function formatCallReviewMoment(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return `${DAY.format(date)}, ${TIME.format(date)} МСК`;
}

/** «18 500 из 20 000 знаков» — только когда текст близок к пределу; иначе null. */
export function callReviewCounter(length: number, max: number): string | null {
    if (length < max * CALL_REVIEW_COUNTER_FROM) return null;
    return CALL_REVIEW_TEXT.comment.counter(
        length.toLocaleString('ru-RU'),
        max.toLocaleString('ru-RU'),
    );
}

/** Длинный комментарий сворачивается с «Показать полностью». */
export const isCallReviewTextLong = (text: string): boolean =>
    text.length > CALL_REVIEW_COLLAPSE_AFTER;

/** Начало длинного комментария — до границы слова, с многоточием. */
export function callReviewTextPreview(text: string): string {
    if (!isCallReviewTextLong(text)) return text;
    const head = text.slice(0, CALL_REVIEW_COLLAPSE_AFTER);
    const space = head.lastIndexOf(' ');
    const cut = space > CALL_REVIEW_COLLAPSE_AFTER * 0.7 ? head.slice(0, space) : head;
    return `${cut.trimEnd()}…`;
}
