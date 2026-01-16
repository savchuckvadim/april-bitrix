'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal, useUpdatePortal } from '@/modules/entities/portal/lib/hooks';
import { PortalForm } from '@/modules/entities/portal/ui/portal-form';
import { UpdatePortalDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditPortalPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const portalId = parseInt(id, 10);
    const { data: portal, isLoading } = usePortal(portalId);
    const updatePortal = useUpdatePortal();

    const handleSubmit = (data: UpdatePortalDto) => {
        updatePortal.mutate(
            { id: portalId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/portal/${portalId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/portal/${portalId}`);
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

    if (!portal) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Portal не найден</h1>
                    <Button onClick={() => router.push('/portal')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <PortalForm
                mode="edit"
                initialData={portal as UpdatePortalDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updatePortal.isPending}
            />
        </div>
    );
}
