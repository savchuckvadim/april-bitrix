import { ServerError, ServerErrorData } from '../types/server-error.types';

/**
 * Парсит ошибку сервера и извлекает сообщение об ошибке
 *
 * @param error - Ошибка от сервера (может быть Error, ServerErrorResponse или null)
 * @param defaultMessage - Сообщение по умолчанию, если не удалось распарсить ошибку
 * @returns Строка с сообщением об ошибке
 */
export function parseServerError(
    error: ServerError,
    defaultMessage: string = 'Произошла ошибка при сохранении данных'
): string {
    if (!error) {
        return defaultMessage;
    }

    try {
        // Приводим к any для доступа к возможным полям
        const errorAny = error as any;

        // Вариант 1: ошибка в response.data (стандартный формат axios/API)
        const responseData = errorAny?.response?.data;
        // Вариант 2: ошибка напрямую в data
        const errorData: ServerErrorData | undefined = errorAny?.data || responseData;

        if (errorData) {
            const parts: string[] = [];

            // Добавляем message, если есть
            if (errorData.message) {
                parts.push(errorData.message);
            }

            // Добавляем errors, если есть (может быть строкой или массивом строк)
            if (errorData.errors) {
                if (typeof errorData.errors === 'string') {
                    parts.push(errorData.errors);
                } else if (Array.isArray(errorData.errors)) {
                    // Объединяем массив строк в одну строку
                    parts.push(...errorData.errors.filter((e: unknown) => typeof e === 'string'));
                }
            }

            // Если есть хотя бы одна часть, используем их
            if (parts.length > 0) {
                return parts.join('. ');
            }
        }
        // Вариант 3: ошибка в message напрямую
        if (errorAny?.message) {
            return errorAny.message;
        }
    } catch (e) {
        // Если не удалось распарсить, используем дефолтное сообщение
        console.error('Error parsing server error:', e);
    }

    return defaultMessage;
}
