import { createAsyncThunk } from '@reduxjs/toolkit';
import { errorHandler } from './error-handler';

// Утилита для создания thunk'ов с автоматической обработкой ошибок
export const createErrorHandledThunk = <Returned, ThunkArg = void>(
    typePrefix: string,
    thunkFn: (arg: ThunkArg, thunkAPI: any) => Promise<Returned>,
) => {
    return createAsyncThunk<Returned, ThunkArg>(
        typePrefix,
        async (arg, thunkAPI) => {
            try {
                return await thunkFn(arg, thunkAPI);
            } catch (error) {
                // Обрабатываем ошибку через ErrorHandler
                const errorObj =
                    error instanceof Error ? error : new Error(String(error));
                errorHandler.handleError(errorObj);

                // Возвращаем ошибку в thunk
                return thunkAPI.rejectWithValue(errorObj.message);
            }
        },
    );
};

// Утилита для обработки ошибок в существующих thunk'ах
export const handleThunkError = (error: unknown): string => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    errorHandler.handleError(errorObj);
    return errorMessage;
};

// Утилита для проверки API ответов с автоматической обработкой ошибок
export const validateApiResponse = <T>(
    response: T | null | undefined,
    errorMessage: string,
): T => {
    if (!response) {
        const error = new Error(errorMessage);
        errorHandler.handleError(error);
        throw error;
    }
    return response;
};

// Утилита для обработки ошибок в slice
export const handleSliceError = (action: any, context: string): string => {
    const errorMessage =
        (action.payload as string) ||
        action.error.message ||
        'Неизвестная ошибка';

    // Не обрабатываем AbortError как критическую ошибку
    if (action.error.name === 'AbortError') {
        return errorMessage;
    }

    // Для других ошибок уведомляем ErrorHandler
    const error = new Error(`${context}: ${errorMessage}`);
    errorHandler.handleError(error);

    return errorMessage;
};
