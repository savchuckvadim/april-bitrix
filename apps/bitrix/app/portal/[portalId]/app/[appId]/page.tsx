'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Progress } from '@workspace/ui/components/progress';
import {
    ArrowLeft,
    Settings,
    ExternalLink,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader,
    Briefcase,
    HeadphonesIcon,
    Megaphone,
    Shield,
    BarChart3,
    Plus,
    RefreshCcw,
    Zap,
    Play,
    Pause,
    RotateCcw
} from 'lucide-react';
import {
    BitrixApp,
    BitrixPlacement,
    getAppGroupLabel,
    getStatusLabel,
    getStatusColor
} from '../../../../../modules/entities/entities';


export default function AppDashboardPage() {
    const params = useParams();
    const portalId = params.portalId as string;
    const appId = params.appId as string;

    const [app, setApp] = useState<BitrixApp | null>(null);
    const [placements, setPlacements] = useState<BitrixPlacement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        const loadApp = async () => {
            setIsLoading(true);
            try {
                // Имитация загрузки данных
                await new Promise(resolve => setTimeout(resolve, 1000));

                const mockApp: BitrixApp = {
                    id: BigInt(appId),
                    portal_id: BigInt(portalId),
                    group: 'sales',
                    type: 'widget',
                    code: 'sales_app_1',
                    status: 'installed',
                    bitrix_tokens: {
                        id: BigInt(1),
                        bitrix_app_id: BigInt(appId),
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
                };

                const mockPlacements: BitrixPlacement[] = [
                    {
                        id: BigInt(1),
                        bitrix_app_id: BigInt(appId),
                        code: 'crm_deal_tab',
                        type: 'crm_tab',
                        group: 'sales',
                        status: 'installed',
                        bitrix_handler: 'https://app.example.com/bitrix/crm_deal_tab',
                        public_handler: 'https://app.example.com/public/crm_deal_tab',
                        bitrix_codes: 'BX.CrmDealTab',
                        bitrix_app: app as BitrixApp,
                        settings: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: BigInt(2),
                        bitrix_app_id: BigInt(appId),
                        code: 'crm_deal_button',
                        type: 'crm_button',
                        group: 'sales',
                        status: 'installing',
                        bitrix_handler: 'https://app.example.com/bitrix/crm_deal_button',
                        public_handler: 'https://app.example.com/public/crm_deal_button',
                        bitrix_codes: 'BX.CrmDealButton',
                        bitrix_app: app as BitrixApp,
                        settings: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: BigInt(3),
                        bitrix_app_id: BigInt(appId),
                        code: 'crm_deal_widget',
                        type: 'crm_widget',
                        group: 'sales',
                        status: 'error',
                        bitrix_handler: 'https://app.example.com/bitrix/crm_deal_widget',
                        public_handler: 'https://app.example.com/public/crm_deal_widget',
                        bitrix_codes: 'BX.CrmDealWidget',
                        bitrix_app: app as BitrixApp,
                        settings: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];

                setApp(mockApp);
                setPlacements(mockPlacements);
            } catch (err) {
                console.error('Ошибка загрузки данных приложения:', err);
                setError('Ошибка загрузки данных приложения');
            } finally {
                setIsLoading(false);
            }
        };

        loadApp();
    }, [app, portalId, appId]);

    const handleInstallApp = async () => {
        setIsInstalling(true);
        try {
            // Имитация установки приложения
            await new Promise(resolve => setTimeout(resolve, 3000));
            setApp(prev => prev ? { ...prev, status: 'installed' } : null);
        } catch (err) {
            console.error('Ошибка установки приложения:', err);
            setError('Ошибка установки приложения');
        } finally {
            setIsInstalling(false);
        }
    };

    const handleInstallPlacement = async (placementId: bigint) => {
        try {
            // Имитация установки виджета
            await new Promise(resolve => setTimeout(resolve, 2000));
            setPlacements(prev => prev.map(p =>
                p.id === placementId ? { ...p, status: 'installed' } : p
            ));
        } catch (err) {
            console.error('Ошибка установки виджета:', err);
            setError('Ошибка установки виджета');
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

    const getPlacementIcon = (type: string) => {
        const icons = {
            crm_tab: Settings,
            crm_button: Zap,
            crm_menu: Settings,
            crm_widget: Settings,
            webhook: Zap
        };
        return icons[type as keyof typeof icons] || Settings;
    };

    const getPlacementTypeLabel = (type: string) => {
        const labels = {
            crm_tab: 'Вкладка CRM',
            crm_button: 'Кнопка CRM',
            crm_menu: 'Меню CRM',
            crm_widget: 'Виджет CRM',
            webhook: 'Вебхук'
        };
        return labels[type as keyof typeof labels] || type;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !app) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Приложение не найдено'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const AppIcon = getAppIcon(app.group);
    const installedPlacements = placements.filter(p => p.status === 'installed').length;
    const totalPlacements = placements.length;
    const installationProgress = totalPlacements > 0 ? (installedPlacements / totalPlacements) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Навигационная панель */}
            <nav className="bg-white border-b shadow-sm">
                <div className="max-w-8xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/public" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                                Битрикс24 Управление
                            </Link>
                            <div className="hidden md:flex items-center gap-6">
                                <Link href="/public" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Публичный доступ
                                </Link>
                                <Link href="/bitrix" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Кабинет
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge className={`${getStatusColor(app.status)}`}>
                                {getStatusLabel(app.status)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-8xl mx-auto p-6">
                {/* Заголовок */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href={`/portal/${portalId}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад к порталу
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <AppIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {getAppGroupLabel(app.group)}
                                </h1>
                                <p className="text-gray-600">
                                    {app.code} • Управление виджетами и настройками
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Статус приложения */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Settings className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{totalPlacements}</p>
                                    <p className="text-sm text-gray-600">Всего виджетов</p>
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
                                    <p className="text-2xl font-bold text-gray-900">{installedPlacements}</p>
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
                                        {placements.filter(p => p.status === 'installing').length}
                                    </p>
                                    <p className="text-sm text-gray-600">Устанавливается</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Прогресс установки */}
                {totalPlacements > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Прогресс установки</CardTitle>
                            <CardDescription>
                                Установлено {installedPlacements} из {totalPlacements} виджетов
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={installationProgress} className="mb-4" />
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Установлено: {installedPlacements}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Loader className="w-4 h-4 text-yellow-500" />
                                    <span>Устанавливается: {placements.filter(p => p.status === 'installing').length}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span>Ошибки: {placements.filter(p => p.status === 'error').length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Действия с приложением */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Управление приложением</CardTitle>
                            <CardDescription>
                                Основные действия с приложением {app.code}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                {app.status === 'not_installed' && (
                                    <Button onClick={handleInstallApp} disabled={isInstalling}>
                                        {isInstalling ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Установка...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Установить приложение
                                            </>
                                        )}
                                    </Button>
                                )}
                                {app.status === 'installed' && (
                                    <>
                                        <Button variant="outline">
                                            <Pause className="w-4 h-4 mr-2" />
                                            Остановить
                                        </Button>
                                        <Button variant="outline">
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Переустановить
                                        </Button>
                                    </>
                                )}
                                <Button variant="outline">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Настройки
                                </Button>
                                <Button variant="outline">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Открыть в Битрикс
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Виджеты */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Виджеты</h2>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Добавить виджет
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {placements.map((placement) => {
                            const PlacementIcon = getPlacementIcon(placement.type);
                            return (
                                <Card key={placement.id.toString()}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gray-100 rounded-xl">
                                                    <PlacementIcon className="w-6 h-6 text-gray-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg">{placement.code}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {getPlacementTypeLabel(placement.type)} • {placement.group}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge className={`text-xs ${getStatusColor(placement.status)}`}>
                                                            {getStatusLabel(placement.status)}
                                                        </Badge>
                                                        {placement.status === 'installing' && (
                                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                                <Loader className="w-3 h-3 animate-spin" />
                                                                <span>Установка...</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {placement.status === 'not_installed' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleInstallPlacement(placement.id)}
                                                    >
                                                        <Play className="w-4 h-4 mr-2" />
                                                        Установить
                                                    </Button>
                                                )}
                                                {placement.status === 'installed' && (
                                                    <>
                                                        <Button variant="outline" size="sm">
                                                            <Settings className="w-4 h-4 mr-2" />
                                                            Настроить
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <RefreshCcw className="w-4 h-4 mr-2" />
                                                            Переустановить
                                                        </Button>
                                                    </>
                                                )}
                                                {placement.status === 'error' && (
                                                    <Button variant="destructive" size="sm">
                                                        <RefreshCcw className="w-4 h-4 mr-2" />
                                                        Исправить
                                                    </Button>
                                                )}
                                                <Link href={`/portal/${portalId}/app/${appId}/placement/${placement.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Информация о токенах */}
                <Card>
                    <CardHeader>
                        <CardTitle>Информация о подключении</CardTitle>
                        <CardDescription>
                            OAuth токены и настройки приложения
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Client ID</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={app.bitrix_tokens?.client_id || ''}
                                        readOnly
                                        className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono"
                                    />
                                    <Button size="sm" variant="outline">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Redirect URI</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={`https://portal.bitrix24.ru/oauth/callback`}
                                        readOnly
                                        className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono"
                                    />
                                    <Button size="sm" variant="outline">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
