'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useMeasure } from '@/modules/entities/measures/lib/hooks';
import { MeasureCard } from '@/modules/entities/measures/ui/measures-card';
import { Button } from '@workspace/ui/components/button';

export default function MeasureDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const measuresId = parseInt(id, 10);
    const { data: measures, isLoading } = useMeasure(measuresId);

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
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/measures')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <MeasureCard
                item={measures}
                onEdit={() => router.push(`/measures/${measures.id}/edit`)}
                onDelete={() => router.push(`/measures/${measures.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
