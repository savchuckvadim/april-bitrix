'use client';

import { useRouter } from 'next/navigation';
import { BtxRpaForm } from '@/modules/entities/btx-rpas/ui/btxRpas-form';
import { useCreateBtxRpa } from '@/modules/entities/btx-rpas/lib/hooks';
import { CreateBtxRpaDto, UpdateBtxRpaDto } from '@workspace/nest-api';

export default function NewBtxRpaPage() {
    const router = useRouter();
    const createBtxRpa = useCreateBtxRpa();

    const handleSubmit = (data: CreateBtxRpaDto) => {
        createBtxRpa.mutate(data, {
            onSuccess: () => {
                router.push('/btx-rpas');
            },
        });
    };

    const handleCancel = () => {
        router.push('/btx-rpas');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxRpaForm
                mode="create"
                onSubmit={(data: CreateBtxRpaDto | UpdateBtxRpaDto) => handleSubmit(data as CreateBtxRpaDto)}
                onCancel={handleCancel}
                isLoading={createBtxRpa.isPending}
            />
        </div>
    );
}
