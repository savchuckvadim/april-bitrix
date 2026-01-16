'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { usePortalMeasure } from '@/modules/entities/portal-measures/lib/hooks';
import { PortalMeasureCard } from '@/modules/entities/portal-measures/ui/portalMeasures-card';
import { Button } from '@workspace/ui/components/button';

export default function PortalMeasureDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const portalMeasuresId = parseInt(id, 10);
    const { data: portalMeasures, isLoading } = usePortalMeasure(portalMeasuresId);

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
            <div className="mb-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/portal-measures')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <PortalMeasureCard
                item={portalMeasures}
                onEdit={() => router.push(`/portal-measures/${portalMeasures.id}/edit`)}
                onDelete={() => router.push(`/portal-measures/${portalMeasures.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
