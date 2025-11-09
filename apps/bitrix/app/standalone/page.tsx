'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
    Building,
    CheckCircle,

    Globe,
    AlertTriangle,

} from 'lucide-react';
// import {
//     APP_GROUPS,
// } from '../../modules/entities/entities';
import { useAuth } from '@/modules/processes/auth/lib/hooks';
import { useRouter } from 'next/navigation';

export default function PublicPage() {
    const { currentUser, currentClient, logout } = useAuth();
    const router = useRouter();


    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);



    const [portalForm, setPortalForm] = useState({
        name: '',
        domain: ''
    });

    // const [appForm, setAppForm] = useState({
    //     group: 'sales' as keyof typeof APP_GROUPS,
    //     client_id: '',
    //     client_secret: ''
    // });

    // const [showPassword, setShowPassword] = useState(false);
    // const [showSecret, setShowSecret] = useState(false);

    // Копирование в буфер обмена
    // const copyToClipboard = (text: string) => {
    //     navigator.clipboard.writeText(text);
    // };


    // Добавление портала
    const handleAddPortal = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Валидация домена
            // const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.bitrix24\.(ru|com|ua|kz|by)$/;
            // if (!domainRegex.test(portalForm.domain)) {
            //     setError('Неверный формат домена. Используйте: your-portal.bitrix24.ru');
            //     setIsLoading(false);
            //     return;
            // }

            // // Имитация добавления портала
            // await new Promise(resolve => setTimeout(resolve, 1000));

            // const newPortal: Portal = {
            //     id: BigInt(Date.now()),
            //     domain: portalForm.domain,
            //     name: portalForm.name,
            //     isActive: true,
            //     bitrixApps: [],
            //     createdAt: new Date()
            // };

            // setCurrentUser(prev => prev ? {
            //     ...prev,
            //     portals: [...prev.portals, newPortal]
            // } : null);

            // setPortalForm({ name: '', domain: '' });
            // setSuccess('Портал успешно добавлен! Теперь создайте приложение.');
        } catch (err) {
            console.error('Ошибка:', err);
            setError('Ошибка добавления портала.');
        } finally {
            setIsLoading(false);
        }
    };

    // Создание приложения
    // const handleCreateApp = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsLoading(true);
    //     setError(null);

    //     try {
    //         // Имитация создания приложения
    //         // await new Promise(resolve => setTimeout(resolve, 1000));

    //         // const newApp: BitrixApp = {
    //         //     id: BigInt(Date.now()),
    //         //     portal_id: currentUser?.portals[0]?.id || BigInt(0),
    //         //     group: appForm.group as 'sales' | 'service' | 'marketing' | 'support' | 'analytics',
    //         //     type: 'widget',
    //         //     code: `${appForm.group}_app_${Date.now()}`,
    //         //     status: 'not_installed',
    //         //     bitrix_tokens: {
    //         //         id: BigInt(Date.now() + 1),
    //         //         bitrix_app_id: BigInt(Date.now()),
    //         //         client_id: appForm.client_id,
    //         //         client_secret: appForm.client_secret,
    //         //         access_token: '',
    //         //         refresh_token: '',
    //         //         expires_at: new Date(Date.now() + 3600000),
    //         //         application_token: '',
    //         //         member_id: '',
    //         //         createdAt: new Date(),
    //         //         updatedAt: new Date()
    //         //     },
    //         //     placements: [],
    //         //     settings: [],
    //         //     createdAt: new Date(),
    //         //     updatedAt: new Date()
    //         // };

    //         // setCurrentUser(prev => prev ? {
    //         //     ...prev,
    //         //     portals: prev.portals.map((portal, index) =>
    //         //         index === 0 ? { ...portal, bitrixApps: [...portal.bitrixApps, newApp] } : portal
    //         //     )
    //         // } : null);

    //         // setAppForm({ group: 'sales' as keyof typeof APP_GROUPS, client_id: '', client_secret: '' });
    //         // setSuccess('Приложение успешно создано! Теперь вы можете перейти в кабинет.');
    //     } catch (err) {
    //         setError('Ошибка создания приложения.');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // Выход из системы
    const handleLogout = () => {
        router.push('/auth/login'); // 🚀 редирект вручную

        logout();


    };



    // Если пользователь авторизован
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Навигационная панель */}
            <nav className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Битрикс24 Управление
                            </h1>
                            <div className="hidden md:flex items-center gap-6">
                                <span className="text-blue-600 font-medium">Личный кабинет</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                                Добро пожаловать, {currentUser?.name}
                            </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto p-6">
                {/* Уведомления */}
                {success && (
                    <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Личный кабинет
                    </h1>
                    <p className="text-gray-600">
                        Управление порталами Битрикс24 и настройка приложений
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Портал */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Ваш портал Битрикс24
                            </CardTitle>
                            <CardDescription>
                                {/* {currentUser?.portals.length === 0
                                    ? 'Добавьте свой портал Битрикс24'
                                    : 'Информация о подключенном портале'
                                } */}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {currentClient ? (
                                <form onSubmit={handleAddPortal} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="portal-name">Название портала</Label>
                                        <Input
                                            id="portal-name"
                                            type="text"
                                            placeholder="Мой портал"
                                            value={portalForm.name}
                                            onChange={(e) => setPortalForm(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="portal-domain">Домен портала</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="portal-domain"
                                                type="text"
                                                placeholder="your-portal.bitrix24.ru"
                                                value={portalForm.domain}
                                                onChange={(e) => setPortalForm(prev => ({ ...prev, domain: e.target.value }))}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Формат: your-portal.bitrix24.ru
                                        </p>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Добавление...
                                            </>
                                        ) : (
                                            <>
                                                <Building className="w-4 h-4 mr-2" />
                                                Добавить портал
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    {/* {currentUser?.portals.map((portal) => (
                                        <div key={portal.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold">{portal.name}</h3>
                                                    <p className="text-sm text-gray-600">{portal.domain}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${portal.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                                    <span className="text-sm">{portal.isActive ? 'Активен' : 'Неактивен'}</span>
                                                </div>
                                            </div>

                                            {portal.bitrixApps && portal.bitrixApps.length > 0 ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Приложений: {portal.bitrixApps.length}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {portal.bitrixApps.map((app) => (
                                                            <div key={app.id.toString()} className="flex items-center justify-between text-xs">
                                                                <span className="text-gray-600">{getAppGroupLabel(app.group)}</span>
                                                                <Badge className={`text-xs ${getStatusColor(app.status)}`}>
                                                                    {getStatusLabel(app.status)}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Link href="/bitrix">
                                                        <Button className="w-full">
                                                            <ArrowRight className="w-4 h-4 mr-2" />
                                                            Перейти в кабинет
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm text-amber-600">
                                                        <AlertTriangle className="w-4 h-4" />
                                                        <span>Приложения не созданы</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Создайте приложение для доступа к функциям управления
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))} */}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Настройка приложения */}
                    <Card>
                        {/* <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="w-5 h-5" />
                                Настройка приложения
                            </CardTitle>
                            <CardDescription>
                                {currentUser?.portals.length === 0
                                    ? 'Сначала добавьте портал'
                                    : currentUser?.portals[0]?.bitrixApps && currentUser.portals[0].bitrixApps.length > 0
                                        ? 'Приложения уже созданы'
                                        : 'Создайте приложение для вашего портала'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {currentUser?.portals.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Сначала добавьте портал Битрикс24</p>
                                </div>
                            ) : currentUser?.portals[0]?.bitrixApps && currentUser.portals[0].bitrixApps.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Приложений: {currentUser.portals[0].bitrixApps.length}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {currentUser.portals[0].bitrixApps.map((app) => (
                                            <div key={app.id.toString()} className="border rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-sm">{getAppGroupLabel(app.group)}</span>
                                                    <Badge className={`text-xs ${getStatusColor(app.status)}`}>
                                                        {getStatusLabel(app.status)}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-xs text-gray-600">
                                                    <div className="flex justify-between">
                                                        <span>Client ID:</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-mono">{app.bitrix_tokens?.client_id}</span>
                                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(app.bitrix_tokens?.client_id || '')}>
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Redirect URI:</span>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-mono">{`https://${currentUser.portals[0]?.domain}/oauth/callback`}</span>
                                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`https://${currentUser.portals[0]?.domain}/oauth/callback`)}>
                                                                <Copy className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Link href="/bitrix">
                                        <Button className="w-full">
                                            <ArrowRight className="w-4 h-4 mr-2" />
                                            Перейти в кабинет
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateApp} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="app-group">Тип приложения</Label>
                                        <select
                                            id="app-group"
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
                                        <p className="text-xs text-gray-500">
                                            Выберите тип приложения для вашего портала
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="app-client-id">Client ID</Label>
                                        <Input
                                            id="app-client-id"
                                            type="text"
                                            placeholder="Введите Client ID"
                                            value={appForm.client_id}
                                            onChange={(e) => setAppForm(prev => ({ ...prev, client_id: e.target.value }))}
                                            required
                                        />
                                        <p className="text-xs text-gray-500">
                                            Получите в настройках приложений Битрикс24
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="app-client-secret">Client Secret</Label>
                                        <div className="relative">
                                            <Input
                                                id="app-client-secret"
                                                type={showSecret ? 'text' : 'password'}
                                                placeholder="Введите Client Secret"
                                                value={appForm.client_secret}
                                                onChange={(e) => setAppForm(prev => ({ ...prev, client_secret: e.target.value }))}
                                                className="pr-10"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSecret(!showSecret)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Секретный ключ приложения
                                        </p>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Создание...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Создать приложение
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent> */}
                    </Card>
                </div>

                {/* Инструкции */}
                {/* {currentClient?.portals && currentClient.portals.length > 0 && (!currentUser.portals[0]?.bitrixApps || currentUser.portals[0].bitrixApps.length === 0) && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                Инструкции по настройке
                            </CardTitle>
                            <CardDescription>
                                Пошаговое руководство по созданию приложения в Битрикс24
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-blue-600">1</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">Перейдите в настройки приложений</p>
                                        <p className="text-sm text-gray-600">
                                            В вашем портале Битрикс24 перейдите в раздел "Приложения" → "Разработчикам"
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => window.open(`https://${currentUser.portals[0]?.domain}/marketplace/app/`, '_blank')}
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Открыть настройки
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-blue-600">2</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">Создайте новое приложение</p>
                                        <p className="text-sm text-gray-600">
                                            Нажмите "Создать приложение" и заполните необходимые поля
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-blue-600">3</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">Укажите Redirect URI</p>
                                        <p className="text-sm text-gray-600">
                                            В поле "Redirect URI" укажите: <code className="bg-gray-100 px-1 rounded text-xs">
                                                https://{currentUser.portals[0]?.domain}/oauth/callback
                                            </code>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-blue-600">4</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">Скопируйте данные</p>
                                        <p className="text-sm text-gray-600">
                                            После создания приложения скопируйте Client ID и Client Secret в форму выше
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )} */}
            </div>
        </div>
    );
}
