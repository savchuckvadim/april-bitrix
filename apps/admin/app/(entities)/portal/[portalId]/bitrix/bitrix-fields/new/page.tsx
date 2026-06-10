'use client';

import { useRouter } from 'next/navigation';
import { BitrixFieldForm } from '@/modules/entities/portal-bitrix/bitrix-fields/ui/bitrixFields-form';
import {
    PbxCreateFieldDto,
    PbxUpdateFieldDto,
    useCreateBitrixField,
} from '@/modules/entities/portal-bitrix/bitrix-fields';

export default function NewBitrixFieldPage() {
    const router = useRouter();
    const createBitrixField = useCreateBitrixField();

    const handleSubmit = (data: PbxCreateFieldDto) => {
        createBitrixField.mutate(data as PbxCreateFieldDto, {
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
                onSubmit={(data: PbxCreateFieldDto | PbxUpdateFieldDto) => handleSubmit(data as PbxCreateFieldDto)}
                onCancel={handleCancel}
                isLoading={createBitrixField.isPending}
            />
        </div>
    );
}
