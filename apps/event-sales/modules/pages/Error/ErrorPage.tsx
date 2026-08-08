'use client';

import { Button } from '@workspace/ui/components/button';

interface ErrorPageProps {
    error?: Error;
    resetError?: () => void;
}

/**
 * Экран непредвиденной ошибки.
 *
 * Оформление намеренно скупое: экран показывается поверх уже сломанного
 * состояния, и чем меньше он тянет за собой компонентов и анимаций, тем выше
 * шанс, что он вообще отрисуется.
 */
export const ErrorPage = ({ error, resetError }: ErrorPageProps) => {
    /*
     * В проде приложение живёт под префиксом /sales на общем домене
     * (deploy/nginx/next.april-app.ru.conf), и Next подставляет basePath только
     * в next/link, router и next/image. Голый location.href про префикс не
     * знает: раньше кнопка уводила в корень домена, то есть в соседнее
     * приложение — kpi-sales. Префикс приходит из next.config через env.
     */
    const homeHref = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`;

    const retry = () => (resetError ? resetError() : window.location.reload());

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-sm text-center">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                    <svg
                        className="h-6 w-6 text-destructive"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <h1 className="text-lg font-semibold text-foreground">
                    Что-то пошло не так
                </h1>

                {error?.message && (
                    <p className="mt-2 break-words text-sm text-muted-foreground">
                        {error.message}
                    </p>
                )}

                <div className="mt-6 flex flex-col gap-2">
                    <Button onClick={retry}>Попробовать снова</Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            window.location.href = homeHref;
                        }}
                    >
                        На главную
                    </Button>
                </div>
            </div>
        </div>
    );
};
