/**
 * Текст ошибки для секции AI-аналитики. Ручки отвечают 403/400 через
 * глобальный фильтр бэка `{ resultCode: 1, message }`: axios на не-2xx
 * бросает ошибку с `response.data`, а её собственный `message` — «Request
 * failed with status code 403». Здесь достаём текст сервера (пользователю
 * нужна причина: «План дня выключен на портале…», «Звонок не входит в
 * подбор недели…»). Технические тексты (латиница без русского, «status
 * code», «Network Error») на экран не выводим: вместо них — понятный
 * запасной текст, для 403 без текста сервера — «доступ закрыт».
 * Массив сообщений (валидация Nest) склеиваем через «; ».
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/** Запасной текст, когда сервер причину не назвал. */
export const AI_ERROR_GENERIC_TEXT =
    'Не удалось получить данные — попробуйте ещё раз';

/** 403 без текста сервера: повтор не поможет, дело в правах. */
export const AI_ERROR_FORBIDDEN_TEXT = 'Доступ к разделу закрыт';

const HTTP_FORBIDDEN = 403;
const CYRILLIC = /[а-яё]/i;
const TECHNICAL_MARKERS = /status code|network error|timeout|econn/i;

/**
 * Текст похож на служебный: нет ни одной русской буквы либо есть маркеры
 * axios/сети. Такое пользователю не показываем.
 */
export const isAiTechnicalErrorText = (text: string): boolean =>
    !CYRILLIC.test(text) || TECHNICAL_MARKERS.test(text);

/** Текст из тела HTTP-ответа (`error.response.data.message`), если он есть. */
export const aiServerMessage = (error: unknown): string | null => {
    if (!isRecord(error) || !isRecord(error.response)) return null;
    const body = error.response.data;
    if (!isRecord(body)) return null;
    const { message } = body;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message)) {
        const lines = message.filter(
            (item): item is string => typeof item === 'string' && !!item,
        );
        if (lines.length) return lines.join('; ');
    }
    return null;
};

/** HTTP-статус ответа, если ошибка пришла от axios; null — сеть/логика. */
export const aiErrorStatus = (error: unknown): number | null => {
    if (!isRecord(error) || !isRecord(error.response)) return null;
    const { status } = error.response;
    return typeof status === 'number' ? status : null;
};

/**
 * Текст ошибки для секции: понятный текст сервера → понятное сообщение
 * ошибки → «доступ закрыт» для 403 → запасной текст.
 */
export const aiErrorMessage = (error: unknown, fallback: string): string => {
    const server = aiServerMessage(error);
    if (server && !isAiTechnicalErrorText(server)) return server;
    const own = error instanceof Error ? error.message : '';
    if (own && !isAiTechnicalErrorText(own)) return own;
    return aiErrorStatus(error) === HTTP_FORBIDDEN
        ? AI_ERROR_FORBIDDEN_TEXT
        : fallback;
};

/**
 * Текст, уже лежащий в сторе, — на экран: служебный или пустой заменяем
 * запасным (страховка для секций, куда текст попал не через aiErrorMessage).
 */
export const aiUserErrorText = (
    error: string | null | undefined,
    fallback: string = AI_ERROR_GENERIC_TEXT,
): string => {
    const text = error?.trim();
    return text && !isAiTechnicalErrorText(text) ? text : fallback;
};
