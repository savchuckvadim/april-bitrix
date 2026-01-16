'use client';

import { useRouter } from 'next/navigation';
import { BtxDealForm } from '@/modules/entities/btx-deals/ui/btxDeals-form';
import { useCreateBtxDeal } from '@/modules/entities/btx-deals/lib/hooks';
import { CreateBtxDealDto, UpdateBtxDealDto } from '@workspace/nest-api';

export default function NewBtxDealPage() {
    const router = useRouter();
    const createBtxDeal = useCreateBtxDeal();

    const handleSubmit = (data: CreateBtxDealDto) => {
        createBtxDeal.mutate(data, {
            onSuccess: () => {
                router.push('/btx-deals');
            },
        });
    };

    const handleCancel = () => {
        router.push('/btx-deals');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxDealForm
                mode="create"
                onSubmit={(data: CreateBtxDealDto | UpdateBtxDealDto) => handleSubmit(data as CreateBtxDealDto)}
                onCancel={handleCancel}
                isLoading={createBtxDeal.isPending}
            />
        </div>
    );
}
