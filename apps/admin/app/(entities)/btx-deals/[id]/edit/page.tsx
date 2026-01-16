'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxDeal, useUpdateBtxDeal } from '@/modules/entities/btx-deals/lib/hooks';
import { BtxDealForm } from '@/modules/entities/btx-deals/ui/btxDeals-form';
import { UpdateBtxDealDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditBtxDealPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxDealsId = parseInt(id, 10);
    const { data: btxDeals, isLoading } = useBtxDeal(btxDealsId);
    const updateBtxDeal = useUpdateBtxDeal();

    const handleSubmit = (data: UpdateBtxDealDto) => {
        updateBtxDeal.mutate(
            { id: btxDealsId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/btx-deals/${btxDealsId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/btx-deals/${btxDealsId}`);
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

    if (!btxDeals) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BtxDeal не найден</h1>
                    <Button onClick={() => router.push('/btx-deals')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxDealForm
                mode="edit"
                initialData={btxDeals as UpdateBtxDealDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateBtxDeal.isPending}
            />
        </div>
    );
}
