'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { BackButton } from '@/modules/shared/';

export default function NoCompanyPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Хедер с кнопкой назад */}
            <div className="border-b border-border p-4">
                <BackButton />
            </div>

            {/* Основной контент */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    {/* Карточка с сообщением */}
                    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                        {/* Иконка предупреждения */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-destructive"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Заголовок */}
                        <h1 className="text-xl font-semibold text-card-foreground text-center mb-2">
                            Компания не найдена
                        </h1>

                        {/* Описание */}
                        <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                            В данной сделке отсутствует информация о компании.
                            Для продолжения работы необходимо добавить компанию
                            в сделку.
                        </p>

                        {/* Дополнительная информация */}
                        <div className="bg-muted/50 rounded-md p-4 mb-6">
                            <h3 className="font-medium text-card-foreground mb-2">
                                Что можно сделать:
                            </h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Добавить компанию в сделку через Битрикс24
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Связаться с менеджером для уточнения деталей
                                </li>
                                <li className="flex items-start">
                                    <span className="text-primary mr-2">•</span>
                                    Проверить корректность данных в сделке
                                </li>
                            </ul>
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex flex-col space-y-3">
                            <Button
                                variant="default"
                                className="w-full"
                                onClick={() => window.history.back()}
                            >
                                Вернуться назад
                            </Button>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.location.reload()}
                            >
                                Обновить страницу
                            </Button>
                        </div>
                    </div>

                    {/* Дополнительная информация внизу */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-muted-foreground">
                            Если проблема повторяется, обратитесь в техническую
                            поддержку
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
