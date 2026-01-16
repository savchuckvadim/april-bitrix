'use client';

import { useRouter } from 'next/navigation';
import { BxRqForm } from '@/modules/entities/bx-rqs/ui/bxRqs-form';
import { useCreateBxRq } from '@/modules/entities/bx-rqs/lib/hooks';
import { CreateBxRqDto } from '@workspace/nest-api';

export default function NewBxRqPage() {
    const router = useRouter();
    const createBxRq = useCreateBxRq();

    const handleSubmit = (data: CreateBxRqDto) => {
        createBxRq.mutate(data, {
            onSuccess: () => {
                router.push('/bx-rqs');
            },
        });
    };

    const handleCancel = () => {
        router.push('/bx-rqs');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BxRqForm
                mode="create"
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={createBxRq.isPending}
            />
        </div>
    );
}
