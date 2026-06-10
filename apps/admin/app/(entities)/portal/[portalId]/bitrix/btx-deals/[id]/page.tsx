'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxDeal } from '@/modules/entities/portal-bitrix/btx-deals/lib/hooks';
import { Button } from '@workspace/ui/components/button';
import {
    getUrlToBtxDeals,
    getUrlToEditBtxDeal,
} from '@/modules/entities/portal-bitrix/btx-deals';
import { DealDetailsWidget } from '@/modules/widgets';

export default function BtxDealDetailPage({
    params,
}: {
    params: Promise<{ portalId: string; id: string }>;
}) {
    const { portalId, id } = use(params);
    const router = useRouter();
    const parsedPortalId = Number(portalId);
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
                    <Button onClick={() => router.push(getUrlToBtxDeals(parsedPortalId))}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push(getUrlToBtxDeals(parsedPortalId))}
                >
                    ← Назад к списку
                </Button>
            </div>
            <DealDetailsWidget
                portalId={parsedPortalId}
                deal={btxDeals}
                onEdit={() => router.push(getUrlToEditBtxDeal(parsedPortalId, btxDeals.id))}
                onBack={() => router.push(getUrlToBtxDeals(parsedPortalId))}
                categoriesEnabled
                onAddCategory={() => router.push(`/portal/${parsedPortalId}/bitrix/btx-categories/new`)}
            />
        </>
    );
}
