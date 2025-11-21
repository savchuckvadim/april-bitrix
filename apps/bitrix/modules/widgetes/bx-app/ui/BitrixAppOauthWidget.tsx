'use client';

import { useState, useEffect } from 'react';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Badge } from '@workspace/ui/components/badge';
import {
    Key,
    Eye,
    EyeOff,
    Save,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Globe,
    Shield,
    Copy,
    ExternalLink
} from 'lucide-react';

interface OAuthConfig {
    client_id: string;
    client_secret: string;
    domain: string;
    redirect_uri: string;
    scope: string[];
}

export default function BitrixAppOauthWidget() {
    const [config, setConfig] = useState<OAuthConfig>({
        client_id: '',
        client_secret: '',
        domain: '',
        redirect_uri: '',
        scope: ['crm', 'user', 'placement']
    });

    const [showSecret, setShowSecret] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [domainError, setDomainError] = useState<string | null>(null);

    // Загрузка сохраненной конфигурации при монтировании
    useEffect(() => {
        const savedConfig = localStorage.getItem('bitrix_oauth_config');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setConfig(parsed);
                setIsSaved(true);
            } catch (err) {
                console.error('Ошибка загрузки конфигурации:', err);
            }
        }
    }, []);

    // Валидация домена
    const validateDomain = (domain: string) => {
        if (!domain) {
            setDomainError('Домен обязателен');
            return false;
        }

        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.bitrix24\.(ru|com|ua|kz|by)$/;
        if (!domainRegex.test(domain)) {
            setDomainError('Неверный формат домена. Используйте: your-portal.bitrix24.ru');
            return false;
        }

        setDomainError(null);
        return true;
    };

    // Обработка изменения домена
    const handleDomainChange = (value: string) => {
        const cleanDomain = value.trim().toLowerCase();
        setConfig(prev => ({ ...prev, domain: cleanDomain }));

        if (cleanDomain) {
            validateDomain(cleanDomain);
            // Автоматически генерируем redirect_uri
            setConfig(prev => ({
                ...prev,
                redirect_uri: `https://${cleanDomain}/oauth/callback`
            }));
        }
    };

    // Обработка отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Валидация
            if (!validateDomain(config.domain)) {
                setIsLoading(false);
                return;
            }

            if (!config.client_id.trim()) {
                setError('Client ID обязателен');
                setIsLoading(false);
                return;
            }

            if (!config.client_secret.trim()) {
                setError('Client Secret обязателен');
                setIsLoading(false);
                return;
            }

            // Имитация сохранения (здесь будет реальный API вызов)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Сохранение в localStorage
            localStorage.setItem('bitrix_oauth_config', JSON.stringify(config));

            setIsSaved(true);
            setError(null);

            // Сброс флага через 3 секунды
            setTimeout(() => setIsSaved(false), 3000);

        } catch (err) {
            setError('Ошибка сохранения конфигурации');
            console.error('Ошибка:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Копирование в буфер обмена
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Проверка подключения к порталу
    const testConnection = async () => {
        if (!config.domain) {
            setError('Сначала укажите домен портала');
            return;
        }

        setIsLoading(true);
        try {
            // Имитация проверки подключения
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Здесь будет реальная проверка подключения к API Битрикс24
            const isConnected = Math.random() > 0.3; // Имитация результата

            if (isConnected) {
                setError(null);
            } else {
                setError('Не удалось подключиться к порталу. Проверьте домен и настройки');
            }
        } catch (err) {
            console.error('Ошибка:', err);
            setError('Ошибка проверки подключения');
        } finally {
            setIsLoading(false);
        }
    };

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
                                <Link href="/bitrix/placement/list" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Виджеты
                                </Link>
                                <Link href="/bitrix/secret" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
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

            <div className="max-w-6xl mx-auto p-6">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Настройка OAuth
                    </h1>
                    <p className="text-gray-600">
                        Настройте параметры подключения к порталу Битрикс24
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Форма настройки */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="w-5 h-5" />
                                    Параметры подключения
                                </CardTitle>
                                <CardDescription>
                                    Введите данные вашего приложения из Битрикс24
                                </CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Домен портала */}
                                    <div className="space-y-2">
                                        <Label htmlFor="domain" className="text-sm font-medium">
                                            Домен портала Битрикс24 *
                                        </Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <Input
                                                id="domain"
                                                type="text"
                                                placeholder="your-portal.bitrix24.ru"
                                                value={config.domain}
                                                onChange={(e) => handleDomainChange(e.target.value)}
                                                className={`pl-10 ${domainError ? 'border-red-500' : ''}`}
                                                required
                                            />
                                        </div>
                                        {domainError && (
                                            <p className="text-sm text-red-500">{domainError}</p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Формат: your-portal.bitrix24.ru
                                        </p>
                                    </div>

                                    {/* Client ID */}
                                    <div className="space-y-2">
                                        <Label htmlFor="client_id" className="text-sm font-medium">
                                            Client ID *
                                        </Label>
                                        <Input
                                            id="client_id"
                                            type="text"
                                            placeholder="Введите Client ID"
                                            value={config.client_id}
                                            onChange={(e) => setConfig(prev => ({ ...prev, client_id: e.target.value }))}
                                            required
                                        />
                                        <p className="text-xs text-gray-500">
                                            Идентификатор приложения из Битрикс24
                                        </p>
                                    </div>

                                    {/* Client Secret */}
                                    <div className="space-y-2">
                                        <Label htmlFor="client_secret" className="text-sm font-medium">
                                            Client Secret *
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="client_secret"
                                                type={showSecret ? 'text' : 'password'}
                                                placeholder="Введите Client Secret"
                                                value={config.client_secret}
                                                onChange={(e) => setConfig(prev => ({ ...prev, client_secret: e.target.value }))}
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
                                            Секретный ключ приложения из Битрикс24
                                        </p>
                                    </div>

                                    {/* Redirect URI (только для чтения) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="redirect_uri" className="text-sm font-medium">
                                            Redirect URI
                                            <Badge variant="outline" className="ml-2 text-xs">
                                                Автоматически
                                            </Badge>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="redirect_uri"
                                                type="text"
                                                value={config.redirect_uri}
                                                readOnly
                                                className="bg-gray-50 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(config.redirect_uri)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            URL для перенаправления после авторизации
                                        </p>
                                    </div>

                                    {/* Scope */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Разрешения (Scope)
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {config.scope.map((scope) => (
                                                <Badge key={scope} variant="secondary" className="text-xs">
                                                    {scope}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Права доступа для приложения
                                        </p>
                                    </div>

                                    {/* Ошибки */}
                                    {error && (
                                        <Alert variant="destructive">
                                            <XCircle className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Успешное сохранение */}
                                    {isSaved && (
                                        <Alert className="border-green-200 bg-green-50">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <AlertDescription className="text-green-800">
                                                Конфигурация успешно сохранена!
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Кнопки */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isLoading || !!domainError}
                                            className="flex-1"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Сохранение...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Сохранить
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={testConnection}
                                            disabled={isLoading || !config.domain}
                                        >
                                            <Shield className="w-4 h-4 mr-2" />
                                            Проверить подключение
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Информационная панель */}
                    <div className="space-y-6">
                        {/* Статус подключения */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Статус подключения</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Домен портала</span>
                                        {config.domain ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm text-green-600">{config.domain}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <span className="text-sm text-gray-500">Не указан</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Client ID</span>
                                        {config.client_id ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm text-green-600">Настроен</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <span className="text-sm text-gray-500">Не указан</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Client Secret</span>
                                        {config.client_secret ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm text-green-600">Настроен</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <span className="text-sm text-gray-500">Не указан</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Инструкции */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Как получить данные</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-semibold text-blue-600">1</span>
                                        </div>
                                        <p>Перейдите в настройки приложений Битрикс24</p>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-semibold text-blue-600">2</span>
                                        </div>
                                        <p>Создайте новое приложение или выберите существующее</p>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-semibold text-blue-600">3</span>
                                        </div>
                                        <p>Скопируйте Client ID и Client Secret</p>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="text-xs font-semibold text-blue-600">4</span>
                                        </div>
                                        <p>Укажите Redirect URI: <code className="bg-gray-100 px-1 rounded text-xs">{config.redirect_uri || 'https://your-portal.bitrix24.ru/oauth/callback'}</code></p>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-4"
                                    onClick={() => window.open(`https://${config.domain || 'your-portal'}.bitrix24.ru/marketplace/app/`, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Открыть настройки приложений
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Предупреждения */}
                        <Card className="border-amber-200 bg-amber-50">
                            <CardHeader>
                                <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Важно
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-amber-700">
                                    <p>• Никогда не передавайте Client Secret третьим лицам</p>
                                    <p>• Данные сохраняются локально в браузере</p>
                                    <p>• Убедитесь, что домен указан корректно</p>
                                    <p>• Redirect URI должен совпадать с настройками в Битрикс24</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
