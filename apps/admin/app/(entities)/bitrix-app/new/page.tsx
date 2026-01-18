'use client';

import { useRouter } from 'next/navigation';
import { BitrixAppForm } from '@/modules/entities/bitrix-app/ui/bitrixApp-form';
import { useCreateBitrixApp } from '@/modules/entities/bitrix-app/lib/hooks';    
import { CreateBitrixAppDto, UpdateBitrixAppDto } from '@workspace/nest-api';

export default function NewBitrixAppPage() {
    const router = useRouter();
    const createBitrixApp = useCreateBitrixApp();

    const handleSubmit = (data: CreateBitrixAppDto) => {
        createBitrixApp.mutate(data, {
            onSuccess: () => {
                router.push('/bitrix-app');
            },
        });
    };

    const handleCancel = () => {
        router.push('/bitrix-app');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BitrixAppForm
                mode="create"
                onSubmit={(data: CreateBitrixAppDto | UpdateBitrixAppDto) => handleSubmit(data as CreateBitrixAppDto)}
                onCancel={handleCancel}
                isLoading={createBitrixApp.isPending}
            />
        </div>
    );
}
