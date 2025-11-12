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
import { useTanstackPortals } from '@/modules/entities/portal';

export default function PublicPage() {
    const { currentUser, currentClient, logout } = useAuth();
    const router = useRouter();
    const { portals, isLoading: isLoadingPortals, error: errorPortals } = useTanstackPortals(
        Number(currentClient?.id)
    );

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);



    const [portalForm, setPortalForm] = useState({
        name: '',
        domain: ''
    });




    // Добавление портала
    const handleAddPortal = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {

        } catch (err) {
            console.error('Ошибка:', err);
            setError('Ошибка добавления портала.');
        } finally {
            setIsLoading(false);
        }
    };



    // Выход из системы
    const handleLogout = () => {
        router.push('/auth/login'); // 🚀 редирект вручную

        logout();


    };



    // Если пользователь авторизован
    return (


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

                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Настройка приложения */}
                <Card>

                </Card>
            </div>

        </div>

    );
}
