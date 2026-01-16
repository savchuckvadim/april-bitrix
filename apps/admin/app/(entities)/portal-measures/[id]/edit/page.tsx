'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalMeasure, useUpdatePortalMeasure } from '@/modules/entities/portal-measures/lib/hooks';
import { PortalMeasureForm } from '@/modules/entities/portal-measures/ui/portalMeasures-form';
import { UpdatePortalMeasureDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditPortalMeasurePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const portalMeasuresId = parseInt(id, 10);
    const { data: portalMeasures, isLoading } = usePortalMeasure(portalMeasuresId);
    const updatePortalMeasure = useUpdatePortalMeasure();

    const handleSubmit = (data: UpdatePortalMeasureDto) => {
        updatePortalMeasure.mutate(
            { id: portalMeasuresId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/portal-measures/${portalMeasuresId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/portal-measures/${portalMeasuresId}`);
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

    if (!portalMeasures) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">PortalMeasure не найден</h1>
                    <Button onClick={() => router.push('/portal-measures')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <PortalMeasureForm
                mode="edit"
                initialData={portalMeasures as UpdatePortalMeasureDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updatePortalMeasure.isPending}
            />
        </div>
    );
}
