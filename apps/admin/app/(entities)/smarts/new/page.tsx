'use client';

import { useRouter } from 'next/navigation';
import { SmartForm } from '@/modules/entities/smarts/ui/smarts-form';
import { useCreateSmart } from '@/modules/entities/smarts/lib/hooks';
import { CreateSmartDto, UpdateSmartDto } from '@workspace/nest-api';

export default function NewSmartPage() {
    const router = useRouter();
    const createSmart = useCreateSmart();

    const handleSubmit = (data: CreateSmartDto) => {
        createSmart.mutate(data, {
            onSuccess: () => {
                router.push('/smarts');
            },
        });
    };

    const handleCancel = () => {
        router.push('/smarts');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <SmartForm
                mode="create"
                onSubmit={(data: CreateSmartDto | UpdateSmartDto) => handleSubmit(data as CreateSmartDto)}
                onCancel={handleCancel}
                isLoading={createSmart.isPending}
            />
        </div>
    );
}
