'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxRpa, useUpdateBtxRpa } from '@/modules/entities/btx-rpas/lib/hooks';
import { BtxRpaForm } from '@/modules/entities/btx-rpas/ui/btxRpas-form';
import { UpdateBtxRpaDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditBtxRpaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxRpasId = parseInt(id, 10);
    const { data: btxRpas, isLoading } = useBtxRpa(btxRpasId);
    const updateBtxRpa = useUpdateBtxRpa();

    const handleSubmit = (data: UpdateBtxRpaDto) => {
        updateBtxRpa.mutate(
            { id: btxRpasId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/btx-rpas/${btxRpasId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/btx-rpas/${btxRpasId}`);
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

    if (!btxRpas) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BtxRpa не найден</h1>
                    <Button onClick={() => router.push('/btx-rpas')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxRpaForm
                mode="edit"
                initialData={btxRpas as UpdateBtxRpaDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateBtxRpa.isPending}
            />
        </div>
    );
}
