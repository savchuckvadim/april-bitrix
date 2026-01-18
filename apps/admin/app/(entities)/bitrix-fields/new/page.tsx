'use client';

import { useRouter } from 'next/navigation';
import { BitrixFieldForm } from '@/modules/entities/bitrix-fields/ui/bitrixFields-form';
import { useCreateBitrixField } from '@/modules/entities/bitrix-fields/lib/hooks';
import { CreateBitrixFieldDto,  UpdateBitrixFieldDto } from '@workspace/nest-api';

export default function NewBitrixFieldPage() {
    const router = useRouter();
    const createBitrixField = useCreateBitrixField();

    const handleSubmit = (data: CreateBitrixFieldDto) => {
        createBitrixField.mutate(data as CreateBitrixFieldDto, {
            onSuccess: () => {
                router.push('/bitrix-fields');
            },
        });
    };

    const handleCancel = () => {
        router.push('/bitrix-fields');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BitrixFieldForm
                mode="create"
                onSubmit={(data: CreateBitrixFieldDto | UpdateBitrixFieldDto) => handleSubmit(data as CreateBitrixFieldDto)}
                onCancel={handleCancel}
                isLoading={createBitrixField.isPending}
            />
        </div>
    );
}
