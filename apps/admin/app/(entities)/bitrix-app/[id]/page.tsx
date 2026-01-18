'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBitrixApp } from '@/modules/entities/bitrix-app/lib/hooks';
import { BitrixAppCard } from '@/modules/entities/bitrix-app/ui/bitrixApp-card';
import { Button } from '@workspace/ui/components/button';

export default function BitrixAppDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    // const bitrixAppId = parseInt(id, 10);
    const { data: bitrixApp, isLoading } = useBitrixApp();

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!bitrixApp) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BitrixApp не найден</h1>
                    <Button onClick={() => router.push('/bitrix-app')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/bitrix-app')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <BitrixAppCard
                item={bitrixApp}
                onEdit={() => router.push(`/bitrix-app/${bitrixApp.id}/edit`)}
                onDelete={() => router.push(`/bitrix-app/${bitrixApp.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
