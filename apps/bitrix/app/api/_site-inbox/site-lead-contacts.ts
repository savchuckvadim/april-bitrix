/**
 * Правила контактов заявки — те же, что у бэка bot (site-lead.contact.ts):
 * телефон не короче десяти цифр, почта без пустых частей между точками и с
 * доменной зоной из букв. Чистые функции без серверных импортов: ими
 * пользуются и маршруты сайта, и формы в браузере.
 */

export const MIN_PHONE_DIGITS = 10;

/** Почта: части между точками непустые, домен с зоной из двух и более букв. */
const EMAIL_PATTERN =
    /^[^\s@.]+(?:\.[^\s@.]+)*@(?:[^\s@._]+(?:-[^\s@._]+)*\.)+(?:[^\s@.\d_-]{2,}|xn--[a-z0-9-]+)$/i;

export const hasCallablePhone = (phone: string): boolean =>
    phone.replace(/\D/g, '').length >= MIN_PHONE_DIGITS;

export const looksLikeEmail = (email: string): boolean =>
    EMAIL_PATTERN.test(email.trim());

/** Есть ли по чему связаться: телефон из десяти цифр или нормальная почта. */
export const hasReachableContact = (contact: { phone?: string; email?: string }): boolean =>
    hasCallablePhone(contact.phone ?? '') || looksLikeEmail(contact.email ?? '');
