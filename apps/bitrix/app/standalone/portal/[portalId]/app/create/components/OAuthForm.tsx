'use client';

import { Button } from '@workspace/ui/components/button';
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
    Globe,
    Shield,
    Copy,
} from 'lucide-react';
import Image from 'next/image';
import { UseCreateAppFormReturn } from './useCreateAppForm';

interface OAuthFormProps {
    form: UseCreateAppFormReturn;
}

export function OAuthForm({ form }: OAuthFormProps) {
    const {
        config,
        showSecret,
        setShowSecret,
        isSaved,
        error,
        isShowHandlerInstructions,
        setIsShowHandlerInstructions,
        isShowHandlerInstallerInstructions,
        setIsShowHandlerInstallerInstructions,
        register,
        handleSubmit,
        watch,
        setValue,
        errors,
        onSubmit,
        validateDomain,
        handleDomainChange,
        copyToClipboard,
        testConnection,
        isLoading,
        selectedPortal,
    } = form;

    return (
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
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Домен портала */}
                        <div className="space-y-2">
                            <Label htmlFor="domain" className="text-sm font-medium">
                                Домен портала Битрикс24 *
                            </Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    {...register("domain", {
                                        required: "Домен обязателен",
                                        validate: validateDomain,
                                    })}
                                    type="text"
                                    placeholder="your-portal.bitrix24.ru"
                                    defaultValue={selectedPortal?.domain || '' as string}
                                    onChange={(e) => handleDomainChange(e.target.value)}
                                    className={`pl-10 ${errors.domain ? 'border-red-500' : ''}`}
                                    required
                                />
                            </div>
                            {errors.domain && (
                                <p className="text-red-500 text-sm">{errors.domain.message}</p>
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
                                {...register("secret.client_id", {
                                    required: "Client ID обязателен",
                                })}
                                type="text"
                                placeholder="Введите Client ID"
                                onChange={(e) => setValue("secret.client_id", e.target.value)}
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
                                    {...register("secret.client_secret", {
                                        required: "Client Secret обязателен",
                                    })}
                                    value={watch("secret.client_secret") as string}
                                    type={showSecret ? 'text' : 'password'}
                                    placeholder="Введите Client Secret"
                                    onChange={(e) => setValue("secret.client_secret", e.target.value)}
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

                        <div className="space-y-2">
                            <Label htmlFor="handler_url" className="text-sm font-medium">
                                URL приложения
                                <Badge variant="outline" className="ml-2 text-xs">
                                    Автоматически
                                </Badge>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="handler_url"
                                    type="text"
                                    value={config.handler_url}
                                    readOnly
                                    className="bg-gray-50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(config.handler_url)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">
                                URL приложения - надо вставить как Путь вашего обработчика*
                            </p>

                            <div className='w-full flex justify-end'>
                                <div className='cursor-pointer flex items-center gap-2' onClick={() => setIsShowHandlerInstallerInstructions(!isShowHandlerInstallerInstructions)}>
                                    <p className='text-xs'>
                                        {isShowHandlerInstallerInstructions ? 'Скрыть инструкции' : 'Показать инструкции'}
                                    </p>
                                    {
                                        isShowHandlerInstallerInstructions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                                    }
                                </div>
                            </div>
                            {isShowHandlerInstallerInstructions && <Image
                                src="/setup-instructions/stage_2_handler_url.png"
                                alt="Handler URL"
                                width={1000}
                                height={1000}
                                className="w-full h-auto"
                            />}
                        </div>

                        {/* URL инсталятора (только для чтения) */}
                        <div className="space-y-2">
                            <Label htmlFor="handler_installer_url" className="text-sm font-medium">
                                Путь для первоначальной установки приложения
                                <Badge variant="outline" className="ml-2 text-xs">
                                    Автоматически
                                </Badge>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="handler_installer_url"
                                    type="text"
                                    value={config.install_url}
                                    readOnly
                                    className="bg-gray-50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(config.install_url)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            <div className='w-full flex justify-end'>
                                <div className='cursor-pointer flex items-center gap-2' onClick={() => setIsShowHandlerInstructions(!isShowHandlerInstructions)}>
                                    <p className='text-xs'>
                                        {isShowHandlerInstructions ? 'Скрыть инструкции' : 'Показать инструкции'}
                                    </p>
                                    {
                                        isShowHandlerInstructions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                                    }
                                </div>
                            </div>
                            {isShowHandlerInstructions && <Image
                                src="/setup-instructions/stage_3_handler.png"
                                alt="Handler URL"
                                width={1000}
                                height={1000}
                                className="w-full h-auto"
                            />}
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
                                disabled={isLoading || !!errors.domain}
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
    );
}

