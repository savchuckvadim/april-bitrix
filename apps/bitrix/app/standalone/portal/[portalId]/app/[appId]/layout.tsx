'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';

import {

    AlertTriangle,
    Loader,
    Briefcase,
    HeadphonesIcon,
    Megaphone,
    Shield,
    BarChart3,

} from 'lucide-react';
import {
    BitrixApp,
    BitrixPlacement,
    getStatusLabel,
    getStatusColor
} from '@/modules/entities/entities';


export default  function AppDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const params = useParams();
    const portalId = params.portalId as string;
    const appId = params.appId as string;

    const [app, setApp] = useState<BitrixApp | null>(null);
    const [placements, setPlacements] = useState<BitrixPlacement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


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

    // const AppIcon = getAppIcon(app.group);
    // const installedPlacements = placements.filter(p => p.status === 'installed').length;
    // const totalPlacements = placements.length;
    // const installationProgress = totalPlacements > 0 ? (installedPlacements / totalPlacements) * 100 : 0;

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


            {children}
        </div>
    );
}
