'use client';

import { useRouter } from 'next/navigation';
import { useCreateRegion, CreateRegionDto, RegionForm } from '@/modules/entities/garant/regions';



export default function NewRegionPage() {
    const router = useRouter();
    const createRegion = useCreateRegion();

    const handleSubmit = (data: CreateRegionDto) => {
        createRegion.mutate(data, {
            onSuccess: () => {
                router.push('/regions');
            },
        });
    };

    const handleCancel = () => {
        router.push('/regions');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <RegionForm
                mode="create"
                onSubmit={(data: CreateRegionDto) => handleSubmit(data)}
                onCancel={handleCancel}
                isLoading={createRegion.isPending}
            />
        </div>
    );
}
