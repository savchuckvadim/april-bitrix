/**
 * Заявка на демо с продающего раздела.
 *
 * Одна и та же проверка работает в форме (подсветить поле до отправки) и в
 * маршруте /api/platform-lead (не верить браузеру). Поэтому она здесь, чистой
 * функцией, а не в компоненте.
 */

/** Предельные длины: обрезаем, а не отказываем — заявка ценнее лишних букв. */
export const DEMO_REQUEST_LIMITS = {
    name: 100,
    phone: 40,
    company: 200,
    comment: 2000,
} as const;

/** Меньше цифр в номере не бывает даже у городского без кода страны. */
const MIN_PHONE_DIGITS = 10;

/** Заявки принимаем только со страниц раздела; чужой путь заменяем корнем. */
const PAGE_PREFIX = '/platform';

/**
 * Поле-ловушка для ботов: людям не видно, бот заполняет. Имя то же, что у
 * брифов калибровки (`website`), — один приём на весь сайт.
 */
export const DEMO_REQUEST_HONEYPOT = 'website';

export interface DemoRequest {
    name: string;
    phone: string;
    company: string;
    comment: string;
    /** Страница, с которой пришла заявка: понятно, что человек читал. */
    page: string;
}

export type DemoRequestField = 'name' | 'phone' | 'consent';

export type DemoRequestErrors = Partial<Record<DemoRequestField, string>>;

export type DemoRequestParseResult =
    | { ok: true; request: DemoRequest }
    | { ok: false; errors: DemoRequestErrors };

export const DEMO_REQUEST_MESSAGES = {
    name: 'Как к вам обращаться?',
    phone: 'Нужен телефон, чтобы договориться о времени',
    consent: 'Нужно согласие на обработку данных',
} as const satisfies Record<DemoRequestField, string>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (
    source: Record<string, unknown>,
    key: string,
    limit: number,
): string => {
    const value = source[key];
    return typeof value === 'string' ? value.trim().slice(0, limit) : '';
};

const countDigits = (value: string): number => value.replace(/\D/g, '').length;

const normalizePage = (value: unknown): string =>
    typeof value === 'string' &&
    (value === PAGE_PREFIX || value.startsWith(`${PAGE_PREFIX}/`))
        ? value.slice(0, 200)
        : PAGE_PREFIX;

/** Ловушка заполнена — отправил бот: ответить «ок» и ничего не слать. */
export const isHoneypotFilled = (input: unknown): boolean => {
    if (!isRecord(input)) return false;
    const value = input[DEMO_REQUEST_HONEYPOT];
    return typeof value === 'string' && value.trim() !== '';
};

/** Проверяет сырое тело запроса или значения формы. */
export function parseDemoRequest(input: unknown): DemoRequestParseResult {
    const source = isRecord(input) ? input : {};

    const request: DemoRequest = {
        name: readText(source, 'name', DEMO_REQUEST_LIMITS.name),
        phone: readText(source, 'phone', DEMO_REQUEST_LIMITS.phone),
        company: readText(source, 'company', DEMO_REQUEST_LIMITS.company),
        comment: readText(source, 'comment', DEMO_REQUEST_LIMITS.comment),
        page: normalizePage(source.page),
    };

    const errors: DemoRequestErrors = {};
    if (!request.name) errors.name = DEMO_REQUEST_MESSAGES.name;
    if (countDigits(request.phone) < MIN_PHONE_DIGITS) {
        errors.phone = DEMO_REQUEST_MESSAGES.phone;
    }
    if (source.consent !== true) errors.consent = DEMO_REQUEST_MESSAGES.consent;

    return Object.keys(errors).length > 0
        ? { ok: false, errors }
        : { ok: true, request };
}
