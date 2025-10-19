// Глобальный обработчик ошибок
export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorCallbacks: Array<(error: Error) => void> = [];
    private criticalErrorCallbacks: Array<(error: Error) => void> = [];
    private isDevelopment = process.env.NODE_ENV === 'development';

    static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    // Подписка на все ошибки
    subscribe(callback: (error: Error) => void) {
        this.errorCallbacks.push(callback);
        return () => {
            const index = this.errorCallbacks.indexOf(callback);
            if (index > -1) {
                this.errorCallbacks.splice(index, 1);
            }
        };
    }

    // Подписка только на критические ошибки (которые должны показать ErrorPage)
    subscribeToCriticalErrors(callback: (error: Error) => void) {
        this.criticalErrorCallbacks.push(callback);
        return () => {
            const index = this.criticalErrorCallbacks.indexOf(callback);
            if (index > -1) {
                this.criticalErrorCallbacks.splice(index, 1);
            }
        };
    }

    // Определяем, является ли ошибка критической
    private isCriticalError(error: Error): boolean {
        // В development режиме показываем все ошибки
        if (this.isDevelopment) {
            return true;
        }

        // Критические ошибки, которые должны показать ErrorPage
        const criticalErrorMessages = [
            'Ошибка получения участников',
            'Ошибка загрузки участников',
            'Network Error',
            'Failed to fetch',
            'Internal Server Error',
            '500',
            '404',
        ];

        return criticalErrorMessages.some(message =>
            error.message.includes(message),
        );
    }

    // Обработка ошибки
    handleError(error: Error) {
        console.error('ErrorHandler caught error:', error);

        // Уведомляем всех подписчиков
        this.errorCallbacks.forEach(callback => {
            try {
                callback(error);
            } catch (callbackError) {
                console.error('Error in error callback:', callbackError);
            }
        });

        // Если ошибка критическая, уведомляем подписчиков критических ошибок
        if (this.isCriticalError(error)) {
            this.criticalErrorCallbacks.forEach(callback => {
                try {
                    callback(error);
                } catch (callbackError) {
                    console.error(
                        'Error in critical error callback:',
                        callbackError,
                    );
                }
            });
        }
    }

    // Обработка асинхронных ошибок
    handleAsyncError(error: unknown) {
        const errorObj =
            error instanceof Error ? error : new Error(String(error));
        this.handleError(errorObj);
    }

    // Создание критической ошибки (принудительно покажет ErrorPage)
    createCriticalError(message: string): Error {
        const error = new Error(message);
        error.name = 'CriticalError';
        this.handleError(error);
        return error;
    }
}

// Экспортируем синглтон
export const errorHandler = ErrorHandler.getInstance();

// Утилита для оборачивания функций
export const withErrorHandling = <T extends any[], R>(
    fn: (...args: T) => R | Promise<R>,
) => {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            errorHandler.handleAsyncError(error);
            throw error; // Перебрасываем ошибку дальше
        }
    };
};
