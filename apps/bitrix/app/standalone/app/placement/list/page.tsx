'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
    Phone,
    FileText,
    BarChart3,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Info,
    ExternalLink
} from 'lucide-react';

// Типы для виджетов
interface WidgetComponent {
    name: string;
    status: 'completed' | 'error' | 'pending' | 'installing';
    progress: number;
    errorMessage?: string;
}

interface Widget {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'not_installed' | 'installing' | 'installed' | 'error';
    components: WidgetComponent[];
    features: string[];
    screenshots: string[];
    installationUrl: string;
    documentationUrl: string;
}

// Данные виджетов
const widgets: Widget[] = [
    {
        id: 'event-sales',
        title: 'События и звонки',
        description: 'Автоматизация работы с клиентами через события и звонки в CRM Битрикс24',
        icon: <Phone className="w-6 h-6" />,
        status: 'installed',
        components: [
            { name: 'Сделки', status: 'completed', progress: 100 },
            { name: 'Поля для Сделок', status: 'completed', progress: 100 },
            { name: 'Списки Отчетности', status: 'error', progress: 0, errorMessage: 'На портале отсутствует возможность установить списки' },
            { name: 'Установка полей для Компаний', status: 'installing', progress: 60 },
            { name: 'Задачи', status: 'pending', progress: 0 },
            { name: 'Реквизиты', status: 'pending', progress: 0 },
            { name: 'Смарт-Процессы', status: 'pending', progress: 0 },
        ],
        features: [
            'Автоматическое создание событий при звонках',
            'Интеграция с телефонией Битрикс24',
            'Отчеты по эффективности звонков',
            'Настройка автоматических действий'
        ],
        screenshots: ['/screenshots/event-sales-1.png', '/screenshots/event-sales-2.png'],
        installationUrl: '/bitrix/placement/details?widget=event-sales',
        documentationUrl: '/docs/event-sales'
    },
    {
        id: 'konstructor',
        title: 'Конструктор документов',
        description: 'Создание и управление документами с автоматическим заполнением данных из CRM',
        icon: <FileText className="w-6 h-6" />,
        status: 'not_installed',
        components: [
            { name: 'Шаблоны документов', status: 'pending', progress: 0 },
            { name: 'Интеграция с CRM', status: 'pending', progress: 0 },
            { name: 'Система подписей', status: 'pending', progress: 0 },
            { name: 'Архив документов', status: 'pending', progress: 0 },
        ],
        features: [
            'Готовые шаблоны договоров и документов',
            'Автозаполнение из данных сделок',
            'Электронная подпись документов',
            'Архивирование и поиск документов'
        ],
        screenshots: ['/screenshots/konstructor-1.png', '/screenshots/konstructor-2.png'],
        installationUrl: '/bitrix/placement/details?widget=konstructor',
        documentationUrl: '/docs/konstructor'
    },
    {
        id: 'kpi-sales',
        title: 'Отчет KPI',
        description: 'Аналитика и отчеты по ключевым показателям эффективности продаж',
        icon: <BarChart3 className="w-6 h-6" />,
        status: 'error',
        components: [
            { name: 'Дашборд KPI', status: 'completed', progress: 100 },
            { name: 'Настройка метрик', status: 'error', progress: 0, errorMessage: 'Ошибка подключения к API' },
            { name: 'Экспорт отчетов', status: 'pending', progress: 0 },
            { name: 'Уведомления', status: 'pending', progress: 0 },
        ],
        features: [
            'Настраиваемые дашборды KPI',
            'Автоматический расчет показателей',
            'Экспорт в Excel и PDF',
            'Уведомления о достижении целей'
        ],
        screenshots: ['/screenshots/kpi-sales-1.png', '/screenshots/kpi-sales-2.png'],
        installationUrl: '/bitrix/placement/details?widget=kpi-sales',
        documentationUrl: '/docs/kpi-sales'
    }
];

// Компонент статуса установки
const InstallationStatus = ({ widget }: { widget: Widget }) => {
    const getStatusIcon = () => {
        switch (widget.status) {
            case 'installed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'installing':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Download className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusText = () => {
        switch (widget.status) {
            case 'installed':
                return 'Установлен';
            case 'installing':
                return 'Устанавливается...';
            case 'error':
                return 'Ошибка установки';
            default:
                return 'Не установлен';
        }
    };

    const getStatusColor = () => {
        switch (widget.status) {
            case 'installed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'installing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="outline" className={getStatusColor()}>
                {getStatusText()}
            </Badge>
        </div>
    );
};

// Компонент прогресса установки
const InstallationProgress = ({ components }: { components: WidgetComponent[] }) => {
    const completedCount = components.filter(c => c.status === 'completed').length;
    const totalCount = components.length;
    const progress = (completedCount / totalCount) * 100;

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>Прогресс установки</span>
                <span>{completedCount}/{totalCount}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="space-y-1">
                {components.map((component, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                            {component.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
                            {component.status === 'error' && <XCircle className="w-3 h-3 text-red-500" />}
                            {component.status === 'installing' && <Clock className="w-3 h-3 text-blue-500" />}
                            {component.status === 'pending' && <div className="w-3 h-3 rounded-full bg-gray-300" />}
                            {component.name}
                        </span>
                        <span className="text-gray-500">{component.progress}%</span>
                    </div>
                ))}
                {components.some(c => c.errorMessage) && (
                    <Alert className="mt-2">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                            {components.find(c => c.errorMessage)?.errorMessage}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
};

// Основной компонент страницы
export default function PlacementListPage() {
    const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);

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
                                <Link href="/bitrix" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Кабинет
                                </Link>
                                <Link href="/bitrix/placement/list" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                                    Виджеты
                                </Link>
                                <Link href="/bitrix/secret" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Настройки
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Подключен
                            </Badge>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-8xl mx-auto p-6">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Управление виджетами
                    </h1>
                    <p className="text-gray-600">
                        Установка и настройка встраиваемых приложений для Битрикс24
                    </p>
                </div>

                {/* Сетка виджетов */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {widgets.map((widget) => (
                        <Card key={widget.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            {widget.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{widget.title}</CardTitle>
                                            <InstallationStatus widget={widget} />
                                        </div>
                                    </div>
                                </div>
                                <CardDescription className="mt-2">
                                    {widget.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Прогресс установки */}
                                {widget.status === 'installing' && (
                                    <InstallationProgress components={widget.components} />
                                )}

                                {/* Кнопки действий */}
                                <div className="flex gap-2">
                                    {widget.status === 'not_installed' && (
                                        <Button
                                            className="flex-1"
                                            onClick={() => setSelectedWidget(widget)}
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Установить
                                        </Button>
                                    )}

                                    {widget.status === 'installing' && (
                                        <Button variant="outline" className="flex-1" disabled>
                                            <Clock className="w-4 h-4 mr-2" />
                                            Устанавливается...
                                        </Button>
                                    )}

                                    {widget.status === 'installed' && (
                                        <Button variant="outline" className="flex-1">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Настроить
                                        </Button>
                                    )}

                                    {widget.status === 'error' && (
                                        <Button variant="destructive" className="flex-1">
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Исправить
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedWidget(widget)}
                                    >
                                        <Info className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Быстрые ссылки */}
                                <div className="flex gap-2 text-sm">
                                    <Button variant="link" size="sm" className="p-0 h-auto">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Документация
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Модальное окно с детальной информацией */}
                {selectedWidget && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            {selectedWidget.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{selectedWidget.title}</CardTitle>
                                            <InstallationStatus widget={selectedWidget} />
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedWidget(null)}
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardDescription className="mt-2">
                                    {selectedWidget.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Прогресс установки */}
                                <div>
                                    <h3 className="font-semibold mb-3">Статус установки</h3>
                                    <InstallationProgress components={selectedWidget.components} />
                                </div>

                                {/* Возможности */}
                                <div>
                                    <h3 className="font-semibold mb-3">Возможности</h3>
                                    <ul className="space-y-2">
                                        {selectedWidget.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Скриншоты */}
                                <div>
                                    <h3 className="font-semibold mb-3">Скриншоты</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedWidget.screenshots.map((screenshot, index) => (
                                            <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                                <span className="text-gray-500 text-sm">Скриншот {index + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Кнопки действий */}
                                <div className="flex gap-3 pt-4 border-t">
                                    {selectedWidget.status === 'not_installed' && (
                                        <Button className="flex-1">
                                            <Download className="w-4 h-4 mr-2" />
                                            Установить виджет
                                        </Button>
                                    )}

                                    {selectedWidget.status === 'installed' && (
                                        <Button className="flex-1">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Настроить виджет
                                        </Button>
                                    )}

                                    <Button variant="outline">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        Документация
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
