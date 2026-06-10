'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CreateRegionDto, RegionForm, useRegion, useUpdateRegion } from '@/modules/entities/garant/regions';
import { Button } from '@workspace/ui/components/button';

export default function EditRegionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const regionId = parseInt(id, 10);
    const { data: region, isLoading } = useRegion(regionId);
    const updateRegion = useUpdateRegion();

    const handleSubmit = (data: CreateRegionDto) => {
        updateRegion.mutate(
            { id: regionId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/regions/${regionId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/regions/${regionId}`);
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

    if (!region) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Region не найден</h1>
                    <Button onClick={() => router.push('/regions')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <RegionForm
                mode="edit"
                initialData={region as CreateRegionDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateRegion.isPending}
            />
        </div>
    );
}
