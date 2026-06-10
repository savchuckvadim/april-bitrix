'use client';

import * as React from 'react';
import { UseFormSetError } from 'react-hook-form';
import { ServerError } from '../types/server-error.types';
import { parseServerError } from '../utils/parse-server-error';

/**
 * Хук для обработки ошибок сервера в формах
 *
 * @param serverError - Ошибка от сервера
 * @param setError - Функция setError из react-hook-form
 * @param defaultMessage - Сообщение по умолчанию для ошибки
 */
export function useServerErrorHandler<T extends Record<string, any>>(
    serverError: ServerError | undefined,
    setError: UseFormSetError<T>,
    defaultMessage: string = 'Произошла ошибка при сохранении данных'
) {
    // Используем useRef для отслеживания последней обработанной ошибки, чтобы избежать зацикливания
    const lastProcessedErrorRef = React.useRef<ServerError>(null);

    React.useEffect(() => {
        // Если ошибка уже была обработана, пропускаем
        if (serverError === lastProcessedErrorRef.current) {
            return;
        }

        if (serverError) {
            // Парсим ошибку и получаем сообщение
            const errorMessage = parseServerError(serverError, defaultMessage);

            // Устанавливаем общую ошибку формы
            setError('root' as any, {
                type: 'server',
                message: errorMessage,
            });

            // Сохраняем ссылку на обработанную ошибку
            lastProcessedErrorRef.current = serverError;
        } else {
            // Очищаем ошибку, если serverError стал null
            if (lastProcessedErrorRef.current) {
                setError('root' as any, { type: 'server', message: undefined });
                lastProcessedErrorRef.current = null;
            }
        }
    }, [serverError, setError, defaultMessage]);
}
