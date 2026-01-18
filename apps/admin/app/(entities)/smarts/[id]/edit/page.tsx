'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSmart, useUpdateSmart } from '@/modules/entities/smarts/lib/hooks';
import { SmartForm } from '@/modules/entities/smarts/ui/smarts-form';
import { UpdateSmartDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditSmartPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const smartsId = parseInt(id, 10);
    const { data: smarts, isLoading } = useSmart(smartsId);
    const updateSmart = useUpdateSmart();

    const handleSubmit = (data: UpdateSmartDto) => {
        updateSmart.mutate(
            { id: smartsId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/smarts/${smartsId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/smarts/${smartsId}`);
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

    if (!smarts) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Smart не найден</h1>
                    <Button onClick={() => router.push('/smarts')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <SmartForm
                mode="edit"
                initialData={smarts as UpdateSmartDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateSmart.isPending}
            />
        </div>
    );
}
