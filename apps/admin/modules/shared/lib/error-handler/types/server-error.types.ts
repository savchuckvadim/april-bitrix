/**
 * Типы для ошибок сервера
 * Используются для типизации ответов API при ошибках
 */

/**
 * Структура ошибки в response.data (стандартный формат axios/API)
 */
export interface ServerErrorResponse {
    response?: {
        data?: ServerErrorData;
    };
    data?: ServerErrorData;
    message?: string;
}

/**
 * Данные об ошибке от сервера
 */
export interface ServerErrorData {
    resultCode?: number;
    message?: string;
    errors?: string | string[];
}

/**
 * Тип для ошибки, которая может быть Error или ServerErrorResponse
 */
export type ServerError = Error | ServerErrorResponse | null | undefined;
