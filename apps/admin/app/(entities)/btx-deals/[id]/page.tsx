'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxDeal } from '@/modules/entities/btx-deals/lib/hooks';
import { BtxDealCard } from '@/modules/entities/btx-deals/ui/btxDeals-card';
import { Button } from '@workspace/ui/components/button';
import { BtxDealResponseDto } from '@workspace/nest-api';

export default function BtxDealDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxDealsId = parseInt(id, 10);
    const { data: btxDeals, isLoading } = useBtxDeal(btxDealsId);

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
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/btx-deals')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <BtxDealCard
                item={btxDeals as BtxDealResponseDto}
                onEdit={() => router.push(`/btx-deals/${btxDeals.id}/edit`)}
                onDelete={() => router.push(`/btx-deals/${btxDeals.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
