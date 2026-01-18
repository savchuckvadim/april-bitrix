'use client';

import { useRouter } from 'next/navigation';
import { PortalForm } from '@/modules/entities/portal/ui/portal-form';
import { useCreatePortal } from '@/modules/entities/portal/lib/hooks';
import { CreatePortalDto, UpdatePortalDto } from '@workspace/nest-api';

export default function NewPortalPage() {
    const router = useRouter();
    const createPortal = useCreatePortal();

    const handleSubmit = (data: CreatePortalDto) => {
        createPortal.mutate(data, {
            onSuccess: () => {
                router.push('/portal');
            },
        });
    };

    const handleCancel = () => {
        router.push('/portal');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <PortalForm
                mode="create"
                onSubmit={(data: CreatePortalDto | UpdatePortalDto) => handleSubmit(data as CreatePortalDto)}
                onCancel={handleCancel}
                isLoading={createPortal.isPending}
            />
        </div>
    );
}
