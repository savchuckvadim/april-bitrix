'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {

    Plus,
    Settings,
    ExternalLink,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader,
    Briefcase,

    BarChart3,
    HeadphonesIcon,
    Megaphone,
    Shield,
    ArrowLeft,

} from 'lucide-react';
import {
    Portal,
    BitrixApp,
    APP_GROUPS,
    getAppGroupLabel,
    getStatusLabel,
    getStatusColor
} from '@/modules/entities/entities';

export default function PortalDashboardPage() {
    const params = useParams();
    const portalId = params.portalId as string;

    const [portal, setPortal] = useState<Portal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateApp, setShowCreateApp] = useState(false);

    // Форма создания приложения
    const [appForm, setAppForm] = useState({
        group: 'sales' as keyof typeof APP_GROUPS,
        client_id: '',
        client_secret: ''
    });

    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        // Загрузка данных портала
        const loadPortal = async () => {
            setIsLoading(true);
            try {
                // Имитация загрузки данных
                await new Promise(resolve => setTimeout(resolve, 1000));

                const mockPortal: Portal = {
                    id: BigInt(portalId),
                    domain: 'my-portal.bitrix24.ru',
                    name: 'Мой портал',
                    isActive: true,
                    bitrixApps: [
                        {
                            id: BigInt(1),
                            portal_id: BigInt(portalId),
                            group: 'sales',
                            type: 'widget',
                            code: 'sales_app_1',
                            status: 'installed',
                            bitrix_tokens: {
                                id: BigInt(1),
                                bitrix_app_id: BigInt(1),
                                client_id: 'local.1234567890abcdef',
                                client_secret: 'secret1234567890abcdef',
                                access_token: 'access_token_here',
                                refresh_token: 'refresh_token_here',
                                expires_at: new Date(Date.now() + 3600000),
                                application_token: 'app_token_here',
                                member_id: 'member_123',
                                createdAt: new Date(),
                                updatedAt: new Date()
                            },
                            placements: [],
                            settings: [],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        {
                            id: BigInt(2),
                            portal_id: BigInt(portalId),
                            group: 'service',
                            type: 'widget',
                            code: 'service_app_1',
                            status: 'installing',
                            bitrix_tokens: {
                                id: BigInt(2),
                                bitrix_app_id: BigInt(2),
                                client_id: 'local.0987654321fedcba',
                                client_secret: 'secret0987654321fedcba',
                                access_token: 'access_token_2',
                                refresh_token: 'refresh_token_2',
                                expires_at: new Date(Date.now() + 3600000),
                                application_token: 'app_token_2',
                                member_id: 'member_456',
                                createdAt: new Date(),
                                updatedAt: new Date()
                            },
                            placements: [],
                            settings: [],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    ],
                    createdAt: new Date()
                };

                setPortal(mockPortal);
            } catch (err) {
                console.error('Ошибка загрузки данных портала:', err);
                setError('Ошибка загрузки данных портала');
            } finally {
                setIsLoading(false);
            }
        };

        loadPortal();
    }, [portalId]);

    const handleCreateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            // Имитация создания приложения
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newApp: BitrixApp = {
                id: BigInt(Date.now()),
                portal_id: BigInt(portalId),
                group: appForm.group as 'sales' | 'service' | 'marketing' | 'support' | 'analytics',
                type: 'widget',
                code: `${appForm.group}_app_${Date.now()}`,
                status: 'not_installed',
                bitrix_tokens: {
                    id: BigInt(Date.now() + 1),
                    bitrix_app_id: BigInt(Date.now()),
                    client_id: appForm.client_id,
                    client_secret: appForm.client_secret,
                    access_token: '',
                    refresh_token: '',
                    expires_at: new Date(Date.now() + 3600000),
                    application_token: '',
                    member_id: '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                placements: [],
                settings: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            setPortal(prev => prev ? {
                ...prev,
                bitrixApps: [...prev.bitrixApps, newApp]
            } : null);

            setAppForm({ group: 'SALES', client_id: '', client_secret: '' });
            setShowCreateApp(false);
        } catch (err) {
            console.error('Ошибка создания приложения:', err);
            setError('Ошибка создания приложения');
        } finally {
            setIsCreating(false);
        }
    };

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !portal) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Портал не найден'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (


        <div className="max-w-8xl mx-auto p-6">
            {/* Заголовок */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/public">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Назад
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {portal.name}
                        </h1>
                        <p className="text-gray-600">
                            Управление приложениями портала {portal.domain}
                        </p>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{portal.bitrixApps.length}</p>
                                <p className="text-sm text-gray-600">Всего приложений</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {portal.bitrixApps.filter(app => app.status === 'installed').length}
                                </p>
                                <p className="text-sm text-gray-600">Установлено</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <Loader className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {portal.bitrixApps.filter(app => app.status === 'installing').length}
                                </p>
                                <p className="text-sm text-gray-600">Устанавливается</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {portal.bitrixApps.filter(app => app.status === 'error').length}
                                </p>
                                <p className="text-sm text-gray-600">Ошибки</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Приложения */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Приложения</h2>
                    <Button onClick={() => setShowCreateApp(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Создать приложение
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portal.bitrixApps.map((app) => {
                        const AppIcon = getAppIcon(app.group);
                        return (
                            <Card key={app.id.toString()} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-xl">
                                            <AppIcon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{getAppGroupLabel(app.group)}</CardTitle>
                                            <CardDescription>{app.code}</CardDescription>
                                        </div>
                                        <Badge className={`text-xs ${getStatusColor(app.status)}`}>
                                            {getStatusLabel(app.status)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="text-sm text-gray-600">
                                            <div className="flex justify-between">
                                                <span>Client ID:</span>
                                                <span className="font-mono text-xs">{app.bitrix_tokens?.client_id}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/portal/${portalId}/app/${app.id}`}>
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Управление
                                                </Button>
                                            </Link>
                                            <Button variant="outline" size="sm">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Модальное окно создания приложения */}
            {showCreateApp && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Создание приложения</CardTitle>
                            <CardDescription>
                                Создайте новое приложение для портала {portal.domain}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateApp} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Тип приложения</label>
                                    <select
                                        value={appForm.group}
                                        onChange={(e) => setAppForm(prev => ({ ...prev, group: e.target.value as keyof typeof APP_GROUPS }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="sales">Продажи</option>
                                        <option value="service">Сервис</option>
                                        <option value="marketing">Маркетинг</option>
                                        <option value="support">Поддержка</option>
                                        <option value="analytics">Аналитика</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client ID</label>
                                    <input
                                        type="text"
                                        placeholder="Введите Client ID"
                                        value={appForm.client_id}
                                        onChange={(e) => setAppForm(prev => ({ ...prev, client_id: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client Secret</label>
                                    <input
                                        type="password"
                                        placeholder="Введите Client Secret"
                                        value={appForm.client_secret}
                                        onChange={(e) => setAppForm(prev => ({ ...prev, client_secret: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateApp(false)}
                                        className="flex-1"
                                    >
                                        Отмена
                                    </Button>
                                    <Button type="submit" disabled={isCreating} className="flex-1">
                                        {isCreating ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Создание...
                                            </>
                                        ) : (
                                            'Создать'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>

    );
}
