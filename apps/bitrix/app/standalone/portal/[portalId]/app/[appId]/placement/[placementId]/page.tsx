'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import {
    ArrowLeft,
    Settings,
    ExternalLink,

    AlertTriangle,
    Loader,
    Play,
    Pause,
    RotateCcw,
    Save,
    Copy,

} from 'lucide-react';
import {
    BitrixPlacement,
    BitrixSetting,

    getStatusLabel,
    getStatusColor
} from '@/modules/entities/entities';

export default function PlacementManagementPage() {
    const params = useParams();
    const portalId = params.portalId as string;
    const appId = params.appId as string;
    const placementId = params.placementId as string;

    const [placement, setPlacement] = useState<BitrixPlacement | null>(null);
    const [settings, setSettings] = useState<BitrixSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    // const [showSecret, setShowSecret] = useState(false);

    // Форма настроек
    const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadPlacement = async () => {
            setIsLoading(true);
            try {
                // Имитация загрузки данных
                await new Promise(resolve => setTimeout(resolve, 1000));

                const mockPlacement: BitrixPlacement = {
                    id: BigInt(placementId),
                    bitrix_app_id: BigInt(appId),
                    code: 'crm_deal_tab',
                    type: 'crm_tab',
                    group: 'sales',
                    status: 'installed',
                    bitrix_handler: 'https://app.example.com/bitrix/crm_deal_tab',
                    public_handler: 'https://app.example.com/public/crm_deal_tab',
                    bitrix_codes: 'BX.CrmDealTab',
                    bitrix_app: undefined,
                    settings: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const mockSettings: BitrixSetting[] = [
                    {
                        id: BigInt(1),
                        entity_type: 'placement',
                        entity_id: BigInt(placementId),
                        key: 'title',
                        value: 'Дополнительная информация',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: BigInt(2),
                        entity_type: 'placement',
                        entity_id: BigInt(placementId),
                        key: 'description',
                        value: 'Виджет для отображения дополнительной информации о сделке',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: BigInt(3),
                        entity_type: 'placement',
                        entity_id: BigInt(placementId),
                        key: 'icon',
                        value: 'icon-info',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: BigInt(4),
                        entity_type: 'placement',
                        entity_id: BigInt(placementId),
                        key: 'sort',
                        value: '100',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        id: BigInt(5),
                        entity_type: 'placement',
                        entity_id: BigInt(placementId),
                        key: 'enabled',
                        value: 'true',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];

                setPlacement(mockPlacement);
                setSettings(mockSettings);

                // Инициализация формы настроек
                const formData: Record<string, string> = {};
                mockSettings.forEach(setting => {
                    formData[setting.key] = setting.value;
                });
                setSettingsForm(formData);
            } catch (err) {
                console.error('Ошибка загрузки данных виджета:', err);
                setError('Ошибка загрузки данных виджета');
            } finally {
                setIsLoading(false);
            }
        };

        loadPlacement();
    }, [portalId, appId, placementId]);

    const handleInstall = async () => {
        setIsInstalling(true);
        try {
            // Имитация установки
            await new Promise(resolve => setTimeout(resolve, 3000));
            setPlacement(prev => prev ? { ...prev, status: 'installed' } : null);
        } catch (err) {
            console.error('Ошибка установки виджета:', err);
            setError('Ошибка установки виджета');
        } finally {
            setIsInstalling(false);
        }
    };

    const handleUninstall = async () => {
        setIsInstalling(true);
        try {
            // Имитация удаления
            await new Promise(resolve => setTimeout(resolve, 2000));
            setPlacement(prev => prev ? { ...prev, status: 'not_installed' } : null);
        } catch (err) {
            console.error('Ошибка удаления виджета:', err);
            setError('Ошибка удаления виджета');
        } finally {
            setIsInstalling(false);
        }
    };

    const handleReinstall = async () => {
        setIsInstalling(true);
        try {
            // Имитация переустановки
            await new Promise(resolve => setTimeout(resolve, 4000));
            setPlacement(prev => prev ? { ...prev, status: 'installed' } : null);
        } catch (err) {
            console.error('Ошибка переустановки виджета:', err);
            setError('Ошибка переустановки виджета');
        } finally {
            setIsInstalling(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            // Имитация сохранения настроек
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Обновляем настройки
            const updatedSettings = settings.map(setting => ({
                ...setting,
                value: settingsForm[setting.key] || setting.value,
                updatedAt: new Date()
            }));
            setSettings(updatedSettings);
        } catch (err) {
            console.error('Ошибка сохранения настроек:', err);
            setError('Ошибка сохранения настроек');
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
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

    if (error || !placement) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Alert className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'Виджет не найден'}
                    </AlertDescription>
                </Alert>
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
                            <Badge className={`${getStatusColor(placement.status)}`}>
                                {getStatusLabel(placement.status)}
                            </Badge>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-8xl mx-auto p-6">
                {/* Заголовок */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href={`/portal/${portalId}/app/${appId}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Назад к приложению
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Settings className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {placement.code}
                                </h1>
                                <p className="text-gray-600">
                                    {getPlacementTypeLabel(placement.type)} • Управление виджетом
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Действия с виджетом */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Управление виджетом</CardTitle>
                            <CardDescription>
                                Основные действия с виджетом {placement.code}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                {placement.status === 'not_installed' && (
                                    <Button onClick={handleInstall} disabled={isInstalling}>
                                        {isInstalling ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Установка...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Установить виджет
                                            </>
                                        )}
                                    </Button>
                                )}
                                {placement.status === 'installed' && (
                                    <>
                                        <Button variant="outline" onClick={handleUninstall} disabled={isInstalling}>
                                            <Pause className="w-4 h-4 mr-2" />
                                            Удалить
                                        </Button>
                                        <Button variant="outline" onClick={handleReinstall} disabled={isInstalling}>
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            Переустановить
                                        </Button>
                                    </>
                                )}
                                {placement.status === 'error' && (
                                    <Button onClick={handleReinstall} disabled={isInstalling}>
                                        {isInstalling ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Исправление...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw className="w-4 h-4 mr-2" />
                                                Исправить
                                            </>
                                        )}
                                    </Button>
                                )}
                                <Button variant="outline">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Открыть в Битрикс
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Основной контент */}
                <Tabs defaultValue="settings" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="settings">Настройки</TabsTrigger>
                        <TabsTrigger value="code">Код</TabsTrigger>
                        <TabsTrigger value="info">Информация</TabsTrigger>
                    </TabsList>

                    <TabsContent value="settings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки виджета</CardTitle>
                                <CardDescription>
                                    Конфигурация параметров виджета {placement.code}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {settings.map((setting) => (
                                        <div key={setting.id.toString()} className="space-y-2">
                                            <Label htmlFor={setting.key}>
                                                {setting.key === 'title' && 'Заголовок'}
                                                {setting.key === 'description' && 'Описание'}
                                                {setting.key === 'icon' && 'Иконка'}
                                                {setting.key === 'sort' && 'Порядок сортировки'}
                                                {setting.key === 'enabled' && 'Включен'}
                                                {!['title', 'description', 'icon', 'sort', 'enabled'].includes(setting.key) && setting.key}
                                            </Label>
                                            {setting.key === 'enabled' ? (
                                                <select
                                                    id={setting.key}
                                                    value={settingsForm[setting.key] || setting.value}
                                                    onChange={(e) => setSettingsForm(prev => ({ ...prev, [setting.key]: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="true">Включен</option>
                                                    <option value="false">Отключен</option>
                                                </select>
                                            ) : (
                                                <Input
                                                    id={setting.key}
                                                    value={settingsForm[setting.key] || setting.value}
                                                    onChange={(e) => setSettingsForm(prev => ({ ...prev, [setting.key]: e.target.value }))}
                                                    placeholder={`Введите ${setting.key}`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                                Сохранение...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Сохранить настройки
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="code">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bitrix Handler</CardTitle>
                                    <CardDescription>
                                        URL обработчика для Битрикс24
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={placement.bitrix_handler}
                                            readOnly
                                            className="flex-1 font-mono text-sm"
                                        />
                                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(placement.bitrix_handler)}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Public Handler</CardTitle>
                                    <CardDescription>
                                        Публичный URL обработчика
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={placement.public_handler}
                                            readOnly
                                            className="flex-1 font-mono text-sm"
                                        />
                                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(placement.public_handler)}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Bitrix Codes</CardTitle>
                                    <CardDescription>
                                        JavaScript коды для интеграции с Битрикс24
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <pre className="text-sm font-mono whitespace-pre-wrap">
                                                {placement.bitrix_codes}
                                            </pre>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(placement.bitrix_codes)}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Копировать код
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="info">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Информация о виджете</CardTitle>
                                    <CardDescription>
                                        Основные данные о виджете {placement.code}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Код виджета</label>
                                                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{placement.code}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Тип</label>
                                                <p className="text-sm">{getPlacementTypeLabel(placement.type)}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Группа</label>
                                                <p className="text-sm">{placement.group}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Статус</label>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`text-xs ${getStatusColor(placement.status)}`}>
                                                        {getStatusLabel(placement.status)}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Создан</label>
                                                <p className="text-sm">{placement.createdAt.toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Обновлен</label>
                                                <p className="text-sm">{placement.updatedAt.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Статистика использования</CardTitle>
                                    <CardDescription>
                                        Данные об использовании виджета
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">0</p>
                                            <p className="text-sm text-gray-600">Вызовов сегодня</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">0</p>
                                            <p className="text-sm text-gray-600">Вызовов за неделю</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">0</p>
                                            <p className="text-sm text-gray-600">Вызовов за месяц</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
