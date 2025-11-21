'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
    Settings,

    BarChart3,
    Key,
    CreditCard,
    Building,
    Webhook,
    AlertTriangle,
    ExternalLink,
    Plus,
    Edit,
    Trash2,
    Eye,
    DollarSign,
    Shield,
    Users,
    Activity,
    Briefcase,
    HeadphonesIcon,
    Megaphone,
} from 'lucide-react';
import Link from 'next/link';
import {
    Client,
    Portal,

    getAppGroupLabel,
    getStatusLabel,
    getStatusColor
} from '../../../entities/entities.js';

// interface OAuthConfig {
//     client_id: string;
//     client_secret: string;
//     domain: string;
//     redirect_uri: string;
//     scope: string[];
// }

interface Subscription {
    plan: string;
    status: 'active' | 'expired' | 'trial' | 'cancelled';
    expiresAt: string;
    price: number;
    currency: string;
    isOverdue: boolean;
    overdueAmount?: number;
}

interface Webhook {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'inactive' | 'error';
    lastTriggered?: string;
    events: string[];
}

interface Organization {
    id: string;
    name: string;
    inn: string;
    address: string;
    isDefault: boolean;
}

export default function BitrixAppCabinetWidget() {
    const [currentUser, setCurrentUser] = useState<Client | null>(null);
    const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasOAuthError, setHasOAuthError] = useState(false);

    const getAppIcon = (group: string) => {
        const icons = {
            sales: Briefcase,
            service: HeadphonesIcon,
            marketing: Megaphone,
            support: Shield,
            analytics: BarChart3
        };
        return icons[group as keyof typeof icons] || Briefcase;
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        setIsLoading(true);

        try {
            // Загрузка пользователя из localStorage
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                const user: Client = JSON.parse(savedUser);
                setCurrentUser(user);

                // Выбираем первый портал по умолчанию
                if (user.portals && user.portals.length > 0) {
                    setSelectedPortal(user.portals[0] || null);
                    setHasOAuthError(false);
                } else {
                    setHasOAuthError(true);
                }
            } else {
                setHasOAuthError(true);
            }

            // Имитация загрузки данных подписки
            const mockSubscription: Subscription = {
                plan: 'Professional',
                status: 'active',
                expiresAt: '2024-12-31',
                price: 2990,
                currency: 'RUB',
                isOverdue: false
            };
            setSubscription(mockSubscription);

            // Имитация загрузки вебхуков
            const mockWebhooks: Webhook[] = [
                {
                    id: '1',
                    name: 'События CRM',
                    url: 'https://api.example.com/webhooks/crm',
                    status: 'active',
                    lastTriggered: '2024-01-15T10:30:00Z',
                    events: ['crm.deal.add', 'crm.contact.update']
                },
                {
                    id: '2',
                    name: 'Звонки',
                    url: 'https://api.example.com/webhooks/calls',
                    status: 'error',
                    events: ['telephony.call.start', 'telephony.call.end']
                }
            ];
            setWebhooks(mockWebhooks);

            // Имитация загрузки организаций
            const mockOrganizations: Organization[] = [
                {
                    id: '1',
                    name: 'ООО "Рога и копыта"',
                    inn: '1234567890',
                    address: 'г. Москва, ул. Примерная, д. 1',
                    isDefault: true
                }
            ];
            setOrganizations(mockOrganizations);

        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSubscriptionStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'expired':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'trial':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSubscriptionStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Активна';
            case 'expired':
                return 'Истекла';
            case 'trial':
                return 'Пробный период';
            case 'cancelled':
                return 'Отменена';
            default:
                return 'Неизвестно';
        }
    };

    const getWebhookStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

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

    return (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка - Виджеты */}
        <div className="lg:col-span-2 space-y-6">
            {/* Виджеты */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Мои виджеты
                        </CardTitle>
                        <Link href="/bitrix/placement/list">
                            <Button variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить
                            </Button>
                        </Link>
                    </div>
                    <CardDescription>
                        Управление установленными виджетами
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedPortal && selectedPortal.bitrixApps && selectedPortal.bitrixApps.length > 0 ? (
                        <div className="space-y-4">
                            {selectedPortal.bitrixApps.map((app) => {
                                const AppIcon = getAppIcon(app.group);
                                return (
                                    <div key={app.id.toString()} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <AppIcon className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{getAppGroupLabel(app.group)}</h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`text-xs ${getStatusColor(app.status)}`}>
                                                        {getStatusLabel(app.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {app.code} • {app.type}
                                        </p>
                                        <div className="flex gap-2">
                                            <Link href={`/portal/${selectedPortal.id}/app/${app.id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Settings className="w-4 h-4 mr-1" />
                                                    Управление
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="ghost">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Нет установленных приложений</p>
                            <Link href="/public" className="mt-4 block">
                                <Button variant="outline">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Создать приложение
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Вебхуки */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Webhook className="w-5 h-5" />
                            Вебхуки
                        </CardTitle>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Добавить
                        </Button>
                    </div>
                    <CardDescription>
                        Настройка уведомлений и интеграций
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {webhooks.map((webhook) => (
                            <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{webhook.name}</h4>
                                        <p className="text-sm text-gray-500">{webhook.url}</p>
                                        {webhook.lastTriggered && (
                                            <p className="text-xs text-gray-400">
                                                Последний вызов: {formatDate(webhook.lastTriggered)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={getWebhookStatusColor(webhook.status)}>
                                        {webhook.status === 'active' ? 'Активен' :
                                            webhook.status === 'inactive' ? 'Неактивен' : 'Ошибка'}
                                    </Badge>
                                    <Button size="sm" variant="ghost">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Правая колонка - Информация */}
        <div className="space-y-6">
            {/* Подписка */}
            {subscription && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Подписка
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Тариф</span>
                                <span className="font-semibold">{subscription.plan}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Статус</span>
                                <Badge variant="outline" className={getSubscriptionStatusColor(subscription.status)}>
                                    {getSubscriptionStatusText(subscription.status)}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Действует до</span>
                                <span className="text-sm">{formatDate(subscription.expiresAt)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Стоимость</span>
                                <span className="font-semibold">
                                    {subscription.price} {subscription.currency}/мес
                                </span>
                            </div>

                            {subscription.isOverdue && subscription.overdueAmount && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                        Задолженность: {subscription.overdueAmount} {subscription.currency}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button className="w-full">
                                <DollarSign className="w-4 h-4 mr-2" />
                                {subscription.isOverdue ? 'Оплатить задолженность' : 'Продлить подписку'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* OAuth настройки */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        OAuth настройки
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Домен</span>
                            <span className="text-sm text-gray-600">
                                {selectedPortal?.domain || 'Не настроен'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Приложения</span>
                            <span className="text-sm text-gray-600">
                                {selectedPortal?.bitrixApps?.length || 0} шт.
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Статус</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${selectedPortal ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm">
                                    {selectedPortal ? 'Подключен' : 'Не подключен'}
                                </span>
                            </div>
                        </div>

                        <Link href="/public">
                            <Button variant="outline" className="w-full">
                                <Settings className="w-4 h-4 mr-2" />
                                Управление порталами
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Организации */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5" />
                        Организации
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {organizations.map((org) => (
                            <div key={org.id} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{org.name}</h4>
                                        <p className="text-sm text-gray-500">ИНН: {org.inn}</p>
                                        <p className="text-xs text-gray-400">{org.address}</p>
                                        {org.isDefault && (
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                Основная
                                            </Badge>
                                        )}
                                    </div>
                                    <Button size="sm" variant="ghost">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Добавить организацию
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Быстрые действия
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Link href="/bitrix/placement/list">
                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="w-4 h-4 mr-2" />
                                Управление виджетами
                            </Button>
                        </Link>

                        <Button variant="outline" className="w-full justify-start">
                            <Webhook className="w-4 h-4 mr-2" />
                            Настройка вебхуков
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Users className="w-4 h-4 mr-2" />
                            Управление пользователями
                        </Button>

                        <Button variant="outline" className="w-full justify-start">
                            <Shield className="w-4 h-4 mr-2" />
                            Безопасность
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>

    );
}
