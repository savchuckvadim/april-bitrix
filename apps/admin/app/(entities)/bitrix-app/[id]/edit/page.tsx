'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBitrixApp, useUpdateBitrixApp } from '@/modules/entities/bitrix-app/lib/hooks';
import { BitrixAppForm } from '@/modules/entities/bitrix-app/ui/bitrixApp-form';
import { UpdateBitrixAppDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditBitrixAppPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const bitrixAppId = parseInt(id, 10);
    const { data: bitrixApp, isLoading } = useBitrixApp();
    const updateBitrixApp = useUpdateBitrixApp();

    const handleSubmit = (data: UpdateBitrixAppDto) => {
        updateBitrixApp.mutate(
            { id: bitrixAppId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/bitrix-app/${bitrixAppId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/bitrix-app/${bitrixAppId}`);
    };

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
            <BitrixAppForm
                mode="edit"
                initialData={bitrixApp as unknown as UpdateBitrixAppDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateBitrixApp.isPending}
            />
        </div>
    );
}
