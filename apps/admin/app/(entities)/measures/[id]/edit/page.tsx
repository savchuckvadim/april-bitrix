'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useMeasure, useUpdateMeasure } from '@/modules/entities/measures/lib/hooks';
import { MeasureForm } from '@/modules/entities/measures/ui/measures-form';
import { UpdateMeasureDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditMeasurePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const measuresId = parseInt(id, 10);
    const { data: measures, isLoading } = useMeasure(measuresId);
    const updateMeasure = useUpdateMeasure();

    const handleSubmit = (data: UpdateMeasureDto) => {
        updateMeasure.mutate(
            { id: measuresId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/measures/${measuresId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/measures/${measuresId}`);
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

    if (!measures) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Measure не найден</h1>
                    <Button onClick={() => router.push('/measures')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <MeasureForm
                mode="edit"
                initialData={measures as UpdateMeasureDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateMeasure.isPending}
            />
        </div>
    );
}
