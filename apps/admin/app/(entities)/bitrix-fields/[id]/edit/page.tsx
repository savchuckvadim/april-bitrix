'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBitrixField, useUpdateBitrixField } from '@/modules/entities/bitrix-fields/lib/hooks';
import { BitrixFieldForm } from '@/modules/entities/bitrix-fields/ui/bitrixFields-form';
import { CreateBitrixFieldsBulkDto, UpdateBitrixFieldDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditBitrixFieldPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const bitrixFieldsId = parseInt(id, 10);
    const { data: bitrixFields, isLoading } = useBitrixField(bitrixFieldsId);
    const updateBitrixField = useUpdateBitrixField();

    const handleSubmit = (data: UpdateBitrixFieldDto) => {
        updateBitrixField.mutate(
            { id: bitrixFieldsId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/bitrix-fields/${bitrixFieldsId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/bitrix-fields/${bitrixFieldsId}`);
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

    if (!bitrixFields) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BitrixField не найден</h1>
                    <Button onClick={() => router.push('/bitrix-fields')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BitrixFieldForm
                mode="edit"
                initialData={bitrixFields as UpdateBitrixFieldDto}
                onSubmit={(data: CreateBitrixFieldsBulkDto | UpdateBitrixFieldDto) => handleSubmit(data as UpdateBitrixFieldDto)}
                onCancel={handleCancel}
                isLoading={updateBitrixField.isPending}
            />
        </div>
    );
}
