/**
 * Текст ошибки для секции AI-аналитики. Ручки отвечают 403/400 через
 * глобальный фильтр бэка `{ resultCode: 1, message }`: axios на не-2xx
 * бросает ошибку с `response.data`, а её собственный `message` — «Request
 * failed with status code 403». Здесь достаём текст сервера (пользователю
 * нужна причина: «План дня выключен на портале…», «Звонок не входит в
 * подбор недели…»), иначе — сообщение ошибки, иначе — запасной текст.
 * Массив сообщений (валидация Nest) склеиваем через «; ».
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

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

export const aiErrorMessage = (error: unknown, fallback: string): string =>
    aiServerMessage(error) ??
    (error instanceof Error && error.message ? error.message : fallback);
