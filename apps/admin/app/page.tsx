import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { AlertTriangle, ArrowRight, BarChart3, CheckCircle, ExternalLink, FileText, Key, Phone, Settings, Users, Webhook, Zap } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Page() {
    redirect('/dashboard');
    return (
        <div className="min-h-screen bg-background/10">
            {/* Навигационная панель */}
            <nav className="bg-card border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Битрикс24 Управление
                            </h1>
                            <div className="hidden md:flex items-center gap-6">
                                <Link href="/bitrix" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Кабинет
                                </Link>
                                <Link href="/bitrix/placement/list" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Виджеты
                                </Link>
                                <Link href="/bitrix/secret" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Настройки
                                </Link>
                                <Link href="/admin/clients" className="text-blue-600 hover:text-blue-800 font-medium">
                                    Клиенты
                                </Link>
                                <Link href="/admin/bitrix-apps" className="text-blue-600 hover:text-blue-800 font-medium">
                                    Bitrix Apps
                                </Link>
                                <Link href="/public" className="text-blue-600 hover:text-blue-800 font-medium">
                                    Для клиентов
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Подключен
                            </Badge>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6">
                {/* Заголовок */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Панель управления Битрикс24
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Централизованное управление встраиваемыми приложениями, настройками и интеграциями для вашего портала
                    </p>
                </div>

                {/* Основные разделы */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
                    {/* Кабинет клиента */}
                    <Link href="/bitrix">
                        <Card    className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-200">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                        <Users className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">Кабинет клиента</CardTitle>
                                        <CardDescription>Обзор и управление всеми настройками</CardDescription>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>OAuth настроен</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>3 виджета установлено</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Подписка активна</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Управление виджетами */}
                    <Link href="/bitrix/placement/list">
                        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-purple-200">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                                        <Settings className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">Управление виджетами</CardTitle>
                                        <CardDescription>Установка и настройка приложений</CardDescription>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Всего виджетов</span>
                                        <Badge variant="outline">3</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Активных</span>
                                        <Badge variant="outline" className="text-green-600 border-green-200">2</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">С ошибками</span>
                                        <Badge variant="outline" className="text-red-600 border-red-200">1</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Настройки OAuth */}
                    <Link href="/bitrix/secret">
                        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-green-200">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                                        <Key className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">Настройки OAuth</CardTitle>
                                        <CardDescription>Подключение к порталу Битрикс24</CardDescription>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Домен настроен</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Client ID получен</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Подключение активно</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Управление клиентами */}
                    <Link href="/admin/clients">
                        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-200">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                        <Users className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">Управление клиентами</CardTitle>
                                        <CardDescription>CRUD операции с клиентами</CardDescription>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Список клиентов</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Создание и редактирование</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Управление доступом</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Bitrix Apps */}
                    <Link href="/admin/bitrix-apps">
                        <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-purple-200">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                                        <Settings className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">Bitrix Apps</CardTitle>
                                        <CardDescription>Управление приложениями</CardDescription>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Список приложений</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Создание и настройка</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Управление статусами</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Виджеты */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Установленные виджеты</h2>
                        <Link href="/bitrix/placement/list">
                            <Button variant="outline">
                                <Settings className="w-4 h-4 mr-2" />
                                Управление всеми
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* События и звонки */}
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Phone className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">События и звонки</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-sm text-green-600">Установлен</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Автоматическое создание событий при звонках в CRM
                                </p>
                                <div className="flex gap-2">
                                    <Link href="/bitrix/placement/details?widget=event-sales">
                                        <Button size="sm" variant="outline">
                                            <Settings className="w-4 h-4 mr-1" />
                                            Настроить
                                        </Button>
                                    </Link>
                                    <Button size="sm" variant="ghost">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Конструктор документов */}
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <FileText className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">Конструктор документов</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                            <span className="text-sm text-gray-500">Не установлен</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Создание документов с автозаполнением из CRM
                                </p>
                                <div className="flex gap-2">
                                    <Link href="/bitrix/placement/details?widget=konstructor">
                                        <Button size="sm">
                                            <Zap className="w-4 h-4 mr-1" />
                                            Установить
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Отчет KPI */}
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">Отчет KPI</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <span className="text-sm text-red-600">Ошибка</span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Аналитика и отчеты по ключевым показателям
                                </p>
                                <div className="flex gap-2">
                                    <Link href="/bitrix/placement/details?widget=kpi-sales">
                                        <Button size="sm" variant="destructive">
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            Исправить
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Быстрые действия */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Быстрые действия</CardTitle>
                        <CardDescription>
                            Часто используемые функции и настройки
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/bitrix">
                                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                    <Users className="w-6 h-6" />
                                    <span className="text-sm">Кабинет</span>
                                </Button>
                            </Link>

                            <Link href="/bitrix/placement/list">
                                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                    <Settings className="w-6 h-6" />
                                    <span className="text-sm">Виджеты</span>
                                </Button>
                            </Link>

                            <Link href="/bitrix/secret">
                                <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                    <Key className="w-6 h-6" />
                                    <span className="text-sm">OAuth</span>
                                </Button>
                            </Link>

                            <Button variant="outline" className="w-full h-20 flex-col gap-2">
                                <Webhook className="w-6 h-6" />
                                <span className="text-sm">Вебхуки</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
