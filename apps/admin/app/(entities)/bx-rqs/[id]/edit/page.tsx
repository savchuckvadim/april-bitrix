'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBxRq, useUpdateBxRq } from '@/modules/entities/bx-rqs/lib/hooks';
import { BxRqForm } from '@/modules/entities/bx-rqs/ui/bxRqs-form';
import { UpdateBxRqDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditBxRqPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const bxRqsId = parseInt(id, 10);
    const { data: bxRqs, isLoading } = useBxRq(bxRqsId);
    const updateBxRq = useUpdateBxRq();

    const handleSubmit = (data: UpdateBxRqDto) => {
        updateBxRq.mutate(
            { id: bxRqsId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/bx-rqs/${bxRqsId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/bx-rqs/${bxRqsId}`);
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

    if (!bxRqs) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BxRq не найден</h1>
                    <Button onClick={() => router.push('/bx-rqs')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BxRqForm
                mode="edit"
                initialData={bxRqs as UpdateBxRqDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateBxRq.isPending}
            />
        </div>
    );
}
