import { errorHandler } from './error-handler';

/** Отклонённое действие createAsyncThunk — то, что приходит в rejected-редьюсер. */
interface RejectedActionLike {
    payload?: unknown;
    error?: { message?: string; name?: string };
}

/**
 * Сообщение об ошибке для slice из rejected-действия + уведомление
 * ErrorHandler. AbortError — не ошибка: запрос отменили намеренно.
 */
export const handleSliceError = (
    action: RejectedActionLike,
    context: string,
): string => {
    const errorMessage =
        (typeof action.payload === 'string' && action.payload) ||
        action.error?.message ||
        'Неизвестная ошибка';

    if (action.error?.name === 'AbortError') {
        return errorMessage;
    }

    errorHandler.handleError(new Error(`${context}: ${errorMessage}`));
    return errorMessage;
};
