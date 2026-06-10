'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { useRegion } from '@/modules/entities/garant/regions';
import { RegionCard } from '@/modules/entities/garant/regions/ui/regions-card/RegionCard';

export default function RegionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const regionId = parseInt(id, 10);
    const { data: regions, isLoading } = useRegion(regionId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!regions) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Region не найден</h1>
                    <Button onClick={() => router.push('/garant/regions')}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 ">
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/garant/regions')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <RegionCard
                item={regions}
                onEdit={() => router.push(`/regions/${regions.id}/edit`)}
                onDelete={() => router.push(`/regions/${regions.id}/delete`)}
                onViewDetails={() => { }}
            />
        </div>
    );
}
