'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Loader } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';

import {
    Portal,

    APP_GROUPS,

} from '@/modules/entities/entities';

export default function PortalDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
        <div className="min-h-screen  w-full">
            {/* Навигационная панель */}
            <nav className="bg-white border-b shadow-sm">

                {/* <div className="max-w-8xl mx-auto px-6 py-4">
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
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>{portal.domain}</span>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Активен
                            </Badge>
                        </div>
                    </div>
                </div> */}
            </nav>

            {children}
        </div>
    );
}
