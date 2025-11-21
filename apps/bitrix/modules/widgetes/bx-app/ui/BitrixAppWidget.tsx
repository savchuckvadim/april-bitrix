'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
    Settings,

    Key,

    AlertTriangle,
    ExternalLink,

} from 'lucide-react';
import Link from 'next/link';
import {

    Portal,

} from '../../../entities/entities';
import BitrixAppCabinetWidget from './BitrixAppWidgetCabinet';



export default function BitrixAppWidget() {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);

    const [hasOAuthError, setHasOAuthError] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка кабинета...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Навигационная панель */}
            <nav className="bg-white border-b shadow-sm">
                <div className="max-w-8xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                                Битрикс24 Управление
                            </Link>
                            <div className="hidden md:flex items-center gap-6">
                                <Link href="/bitrix" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                                    Кабинет
                                </Link>
                                <Link href="/bitrix/placement/list" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Виджеты
                                </Link>
                                <Link href="/bitrix/secret" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Настройки
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedPortal && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>{selectedPortal.domain}</span>
                                </div>
                            )}
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Подключен
                            </Badge>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Заголовок */}
            <div className="bg-gray-50 border-b">
                <div className="max-w-8xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Кабинет клиента
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Управление приложениями и настройками Битрикс24
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Открыть портал
                            </Button>
                            <Button size="sm">
                                <Settings className="w-4 h-4 mr-2" />
                                Настройки
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-8xl mx-auto p-6">
                {/* Ошибка OAuth */}
                {false && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            <div className="flex items-center justify-between">
                                <span>Не настроены OAuth параметры. Настройте подключение к Битрикс24 для полноценной работы.</span>
                                <Link href="/bitrix/secret">
                                    <Button size="sm" variant="outline">
                                        <Key className="w-4 h-4 mr-2" />
                                        Настроить OAuth
                                    </Button>
                                </Link>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Основной контент */}

                <BitrixAppCabinetWidget />
            </div>
        </div>
    );
}
