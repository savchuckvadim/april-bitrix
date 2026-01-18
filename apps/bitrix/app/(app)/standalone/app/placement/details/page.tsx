'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
    Phone,
    FileText,
    BarChart3,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    ArrowLeft,
    ExternalLink,
    Settings,
    Play,
    Pause,
    RotateCcw
} from 'lucide-react';
import Link from 'next/link';

// Типы для виджетов
interface WidgetComponent {
    name: string;
    status: 'completed' | 'error' | 'pending' | 'installing';
    progress: number;
    errorMessage?: string;
    description: string;
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
    requirements: string[];
    changelog: Array<{
        version: string;
        date: string;
        changes: string[];
    }>;
}

// Данные виджетов
const widgets: Widget[] = [
    {
        id: 'event-sales',
        title: 'События и звонки',
        description: 'Автоматизация работы с клиентами через события и звонки в CRM Битрикс24. Полная интеграция с телефонией и создание автоматических событий при входящих и исходящих звонках.',
        icon: <Phone className="w-8 h-8" />,
        status: 'installing',
        components: [
            {
                name: 'Сделки',
                status: 'completed',
                progress: 100,
                description: 'Настройка полей и автоматических действий для сделок'
            },
            {
                name: 'Поля для Сделок',
                status: 'completed',
                progress: 100,
                description: 'Добавление пользовательских полей для отслеживания звонков'
            },
            {
                name: 'Списки Отчетности',
                status: 'error',
                progress: 0,
                errorMessage: 'На портале отсутствует возможность установить списки',
                description: 'Создание отчетов по эффективности звонков'
            },
            {
                name: 'Установка полей для Компаний',
                status: 'installing',
                progress: 60,
                description: 'Настройка полей для компаний и контактов'
            },
            {
                name: 'Задачи',
                status: 'pending',
                progress: 0,
                description: 'Автоматическое создание задач при звонках'
            },
            {
                name: 'Реквизиты',
                status: 'pending',
                progress: 0,
                description: 'Настройка реквизитов для отслеживания звонков'
            },
            {
                name: 'Смарт-Процессы',
                status: 'pending',
                progress: 0,
                description: 'Интеграция со смарт-процессами Битрикс24'
            },
        ],
        features: [
            'Автоматическое создание событий при звонках',
            'Интеграция с телефонией Битрикс24',
            'Отчеты по эффективности звонков',
            'Настройка автоматических действий',
            'Синхронизация с CRM',
            'Уведомления о пропущенных звонках',
            'Аналитика по времени звонков'
        ],
        screenshots: ['/screenshots/event-sales-1.png', '/screenshots/event-sales-2.png'],
        installationUrl: '/bitrix/placement/details?widget=event-sales',
        documentationUrl: '/docs/event-sales',
        requirements: [
            'Битрикс24 с активной подпиской',
            'Права администратора портала',
            'Подключенная телефония',
            'Версия CRM не ниже 20.0.0'
        ],
        changelog: [
            {
                version: '1.2.0',
                date: '2024-01-15',
                changes: [
                    'Добавлена поддержка смарт-процессов',
                    'Улучшена аналитика звонков',
                    'Исправлены ошибки синхронизации'
                ]
            },
            {
                version: '1.1.0',
                date: '2023-12-20',
                changes: [
                    'Добавлены новые типы событий',
                    'Улучшен интерфейс отчетов'
                ]
            }
        ]
    },
    {
        id: 'konstructor',
        title: 'Конструктор документов',
        description: 'Создание и управление документами с автоматическим заполнением данных из CRM. Готовые шаблоны договоров, актов, счетов и других документов с возможностью электронной подписи.',
        icon: <FileText className="w-8 h-8" />,
        status: 'not_installed',
        components: [
            {
                name: 'Шаблоны документов',
                status: 'pending',
                progress: 0,
                description: 'Библиотека готовых шаблонов документов'
            },
            {
                name: 'Интеграция с CRM',
                status: 'pending',
                progress: 0,
                description: 'Автозаполнение документов данными из CRM'
            },
            {
                name: 'Система подписей',
                status: 'pending',
                progress: 0,
                description: 'Электронная подпись документов'
            },
            {
                name: 'Архив документов',
                status: 'pending',
                progress: 0,
                description: 'Хранение и поиск созданных документов'
            },
        ],
        features: [
            'Готовые шаблоны договоров и документов',
            'Автозаполнение из данных сделок',
            'Электронная подпись документов',
            'Архивирование и поиск документов',
            'Настраиваемые поля',
            'Экспорт в PDF и Word',
            'Уведомления о готовности документов'
        ],
        screenshots: ['/screenshots/konstructor-1.png', '/screenshots/konstructor-2.png'],
        installationUrl: '/bitrix/placement/details?widget=konstructor',
        documentationUrl: '/docs/konstructor',
        requirements: [
            'Битрикс24 с активной подпиской',
            'Права администратора портала',
            'Подключение к внешним API',
            'Версия CRM не ниже 20.0.0'
        ],
        changelog: [
            {
                version: '1.0.0',
                date: '2024-01-01',
                changes: [
                    'Первая версия конструктора',
                    'Базовые шаблоны документов',
                    'Интеграция с CRM'
                ]
            }
        ]
    },
    {
        id: 'kpi-sales',
        title: 'Отчет KPI',
        description: 'Аналитика и отчеты по ключевым показателям эффективности продаж. Настраиваемые дашборды, автоматический расчет метрик и экспорт отчетов в различных форматах.',
        icon: <BarChart3 className="w-8 h-8" />,
        status: 'error',
        components: [
            {
                name: 'Дашборд KPI',
                status: 'completed',
                progress: 100,
                description: 'Основной интерфейс для просмотра метрик'
            },
            {
                name: 'Настройка метрик',
                status: 'error',
                progress: 0,
                errorMessage: 'Ошибка подключения к API',
                description: 'Конфигурация показателей эффективности'
            },
            {
                name: 'Экспорт отчетов',
                status: 'pending',
                progress: 0,
                description: 'Экспорт данных в Excel, PDF и другие форматы'
            },
            {
                name: 'Уведомления',
                status: 'pending',
                progress: 0,
                description: 'Уведомления о достижении целей'
            },
        ],
        features: [
            'Настраиваемые дашборды KPI',
            'Автоматический расчет показателей',
            'Экспорт в Excel и PDF',
            'Уведомления о достижении целей',
            'Сравнение периодов',
            'Прогнозирование показателей',
            'Интеграция с внешними системами'
        ],
        screenshots: ['/screenshots/kpi-sales-1.png', '/screenshots/kpi-sales-2.png'],
        installationUrl: '/bitrix/placement/details?widget=kpi-sales',
        documentationUrl: '/docs/kpi-sales',
        requirements: [
            'Битрикс24 с активной подпиской',
            'Права администратора портала',
            'Подключение к API аналитики',
            'Версия CRM не ниже 20.0.0'
        ],
        changelog: [
            {
                version: '1.1.0',
                date: '2024-01-10',
                changes: [
                    'Добавлены новые типы графиков',
                    'Улучшена производительность',
                    'Исправлены ошибки экспорта'
                ]
            }
        ]
    }
];

// Компонент статуса установки
const InstallationStatus = ({ widget }: { widget: Widget }) => {
    const getStatusIcon = () => {
        switch (widget.status) {
            case 'installed':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'installing':
                return <Clock className="w-6 h-6 text-blue-500" />;
            case 'error':
                return <XCircle className="w-6 h-6 text-red-500" />;
            default:
                return <Download className="w-6 h-6 text-gray-500" />;
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
        <div className="flex items-center gap-3">
            {getStatusIcon()}
            <Badge variant="outline" className={`${getStatusColor()} text-lg px-3 py-1`}>
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
        <div className="space-y-4">
            <div className="flex justify-between text-lg">
                <span className="font-semibold">Прогресс установки</span>
                <span className="text-gray-600">{completedCount}/{totalCount}</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="space-y-3">
                {components.map((component, index) => (
                    <Card key={index} className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {component.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                {component.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                                {component.status === 'installing' && <Clock className="w-5 h-5 text-blue-500" />}
                                {component.status === 'pending' && <div className="w-5 h-5 rounded-full bg-gray-300" />}
                                <div>
                                    <h4 className="font-medium">{component.name}</h4>
                                    <p className="text-sm text-gray-600">{component.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-semibold">{component.progress}%</span>
                                {component.status === 'installing' && (
                                    <div className="w-20 mt-1">
                                        <Progress value={component.progress} className="h-1" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {component.errorMessage && (
                            <Alert className="mt-3">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {component.errorMessage}
                                </AlertDescription>
                            </Alert>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

// Основной компонент страницы
export default function PlacementDetailsPage() {
    const searchParams = useSearchParams();
    const widgetId = searchParams.get('widget');
    const [widget, setWidget] = useState<Widget | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        if (widgetId) {
            const foundWidget = widgets.find(w => w.id === widgetId);
            setWidget(foundWidget || null);
        }
    }, [widgetId]);

    const handleInstall = async () => {
        if (!widget) return;

        setIsInstalling(true);
        // Здесь будет логика установки виджета
        // Имитация установки
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsInstalling(false);
    };

    const handlePauseInstallation = () => {
        // Логика приостановки установки
    };

    const handleResumeInstallation = () => {
        // Логика возобновления установки
    };

    const handleRetryInstallation = () => {
        // Логика повторной установки
    };

    if (!widget) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Виджет не найден</h2>
                        <p className="text-gray-600 mb-4">
                            Запрашиваемый виджет не существует или был удален.
                        </p>
                        <Link href="/bitrix/placement/list">
                            <Button>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Вернуться к списку
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Навигация */}
                <div className="mb-6">
                    <Link href="/bitrix/placement/list">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Вернуться к списку виджетов
                        </Button>
                    </Link>
                </div>

                {/* Заголовок виджета */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    {widget.icon}
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">{widget.title}</CardTitle>
                                    <InstallationStatus widget={widget} />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {widget.status === 'not_installed' && (
                                    <Button onClick={handleInstall} disabled={isInstalling} size="lg">
                                        {isInstalling ? (
                                            <>
                                                <Clock className="w-5 h-5 mr-2" />
                                                Установка...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-5 h-5 mr-2" />
                                                Установить
                                            </>
                                        )}
                                    </Button>
                                )}

                                {widget.status === 'installing' && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handlePauseInstallation}>
                                            <Pause className="w-4 h-4 mr-2" />
                                            Приостановить
                                        </Button>
                                        <Button variant="outline" onClick={handleResumeInstallation}>
                                            <Play className="w-4 h-4 mr-2" />
                                            Продолжить
                                        </Button>
                                    </div>
                                )}

                                {widget.status === 'installed' && (
                                    <Button size="lg">
                                        <Settings className="w-5 h-5 mr-2" />
                                        Настроить
                                    </Button>
                                )}

                                {widget.status === 'error' && (
                                    <Button variant="destructive" onClick={handleRetryInstallation} size="lg">
                                        <RotateCcw className="w-5 h-5 mr-2" />
                                        Повторить установку
                                    </Button>
                                )}

                                <Button variant="outline" size="lg">
                                    <ExternalLink className="w-5 h-5 mr-2" />
                                    Документация
                                </Button>
                            </div>
                        </div>
                        <CardDescription className="text-lg mt-4">
                            {widget.description}
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Основной контент */}
                <Tabs defaultValue="installation" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="installation">Установка</TabsTrigger>
                        <TabsTrigger value="features">Возможности</TabsTrigger>
                        <TabsTrigger value="screenshots">Скриншоты</TabsTrigger>
                        <TabsTrigger value="changelog">История версий</TabsTrigger>
                    </TabsList>

                    <TabsContent value="installation" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Статус установки</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <InstallationProgress components={widget.components} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Системные требования</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {widget.requirements.map((requirement, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{requirement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Возможности виджета</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {widget.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="screenshots" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Скриншоты интерфейса</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {widget.screenshots.map((screenshot, index) => (
                                        <div key={index} className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                    <ExternalLink className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <span className="text-gray-500">Скриншот {index + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="changelog" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>История версий</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {widget.changelog.map((version, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold">Версия {version.version}</h3>
                                                <Badge variant="outline">{version.date}</Badge>
                                            </div>
                                            <ul className="space-y-1">
                                                {version.changes.map((change, changeIndex) => (
                                                    <li key={changeIndex} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                                        <span className="text-sm">{change}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
