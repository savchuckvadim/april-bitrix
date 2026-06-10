'use client';

import { useParams, useRouter } from 'next/navigation';
import { BtxDealForm } from '@/modules/entities/portal-bitrix/btx-deals/ui/btxDeals-form';
import { useCreateBtxDeal } from '@/modules/entities/portal-bitrix/btx-deals/lib/hooks';
import { CreateBtxDealDto, UpdateBtxDealDto } from '@workspace/nest-api';
import { getUrlToBtxDeals } from '@/modules/entities/portal-bitrix/btx-deals';

export default function NewBtxDealPage() {
    const router = useRouter();
    const createBtxDeal = useCreateBtxDeal();
    const params = useParams<{ portalId: string }>();
    const portalId = Number(params.portalId);
    const handleSubmit = (data: CreateBtxDealDto) => {
        createBtxDeal.mutate(data, {
            onSuccess: () => {
                router.push(getUrlToBtxDeals(portalId));
            },
        });
    };

    const handleCancel = () => {
        router.push(getUrlToBtxDeals(portalId));
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxDealForm
                portalId={portalId}
                mode="create"
                onSubmit={(data: CreateBtxDealDto | UpdateBtxDealDto) => handleSubmit(data as CreateBtxDealDto)}
                onCancel={handleCancel}
                isLoading={createBtxDeal.isPending}
            />
        </div>
    );
}
