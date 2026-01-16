'use client';

import { useRouter } from 'next/navigation';
import { PortalMeasureForm } from '@/modules/entities/portal-measures/ui/portalMeasures-form';
import { useCreatePortalMeasure } from '@/modules/entities/portal-measures/lib/hooks';
import { CreatePortalMeasureDto, UpdatePortalMeasureDto } from '@workspace/nest-api';

export default function NewPortalMeasurePage() {
    const router = useRouter();
    const createPortalMeasure = useCreatePortalMeasure();

    const handleSubmit = (data: CreatePortalMeasureDto) => {
        createPortalMeasure.mutate(data, {
            onSuccess: () => {
                router.push('/portal-measures');
            },
        });
    };

    const handleCancel = () => {
        router.push('/portal-measures');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <PortalMeasureForm
                mode="create"
                onSubmit={(data: CreatePortalMeasureDto | UpdatePortalMeasureDto) => handleSubmit(data as CreatePortalMeasureDto)}
                onCancel={handleCancel}
                isLoading={createPortalMeasure.isPending}
            />
        </div>
    );
}
