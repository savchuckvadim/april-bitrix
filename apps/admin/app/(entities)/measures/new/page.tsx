'use client';

import { useRouter } from 'next/navigation';
import { MeasureForm } from '@/modules/entities/measures/ui/measures-form';
import { useCreateMeasure } from '@/modules/entities/measures/lib/hooks';
import { CreateMeasureDto, UpdateMeasureDto } from '@workspace/nest-api';

export default function NewMeasurePage() {
    const router = useRouter();
    const createMeasure = useCreateMeasure();

    const handleSubmit = (data: CreateMeasureDto) => {
        createMeasure.mutate(data, {
            onSuccess: () => {
                router.push('/measures');
            },
        });
    };

    const handleCancel = () => {
        router.push('/measures');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <MeasureForm
                mode="create"
                onSubmit={(data: CreateMeasureDto | UpdateMeasureDto) => handleSubmit(data as CreateMeasureDto)}
                onCancel={handleCancel}
                isLoading={createMeasure.isPending}
            />
        </div>
    );
}
