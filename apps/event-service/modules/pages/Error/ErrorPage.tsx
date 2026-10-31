import React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Info } from '@/modules/shared';
import { withBasePath } from '@/modules/app/lib/utills/base-path';

interface ErrorPageProps {
    error?: Error;
    resetError?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetError }) => {
    const handleGoBack = () => {
        if (resetError) {
            resetError();
        } else {
            window.history.back();
        }
    };

    const handleGoHome = () => {
        window.location.href = withBasePath('/');
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <Card className="shadow-lg border-border/50">
                    <CardHeader className="text-center pb-4">
                        {/* Иконка с анимацией */}
                        <div className="mx-auto mb-4">
                            <div className="relative">
                                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center animate-pulse">
                                    <svg
                                        className="w-10 h-10 text-destructive"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                {/* Декоративные круги */}
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/20 rounded-full animate-ping"></div>
                                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-secondary/30 rounded-full animate-ping animation-delay-1000"></div>
                            </div>
                        </div>

                        <CardTitle className="text-2xl font-bold text-card-foreground">
                            😔 Что-то пошло не так
                        </CardTitle>

                        <CardDescription className="text-base text-muted-foreground">
                            Произошла непредвиденная ошибка
                        </CardDescription>

                        {/* Бейдж статуса */}
                        <div className="mt-3">
                            <Badge variant="destructive" className="text-sm">
                                Ошибка системы
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Отображение ошибки */}
                        {error && (
                            <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                <Info title="Детали ошибки" type="error">
                                    {error.message}
                                </Info>
                            </div>
                        )}

                        {/* Информационный блок */}
                        <div className="bg-accent/20 rounded-lg p-3 border border-accent/30">
                            <div className="flex items-start">
                                <svg
                                    className="w-4 h-4 mr-2 mt-0.5 text-accent-foreground flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="text-xs text-accent-foreground">
                                    Попробуйте обновить страницу или вернуться
                                    назад. Если проблема повторяется, обратитесь
                                    в поддержку.
                                </p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-3 pt-6">
                        <Button
                            onClick={handleGoBack}
                            className="w-full"
                            size="lg"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Назад
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleGoHome}
                            className="w-full"
                            size="lg"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            На главную
                        </Button>
                    </CardFooter>
                </Card>

                {/* Футер с дополнительной информацией */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        Если проблема повторяется, обратитесь в{' '}
                        <span className="text-primary hover:underline cursor-pointer">
                            техническую поддержку
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
