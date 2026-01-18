'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxRpa } from '@/modules/entities/btx-rpas/lib/hooks';
import { BtxRpaCard } from '@/modules/entities/btx-rpas/ui/btxRpas-card';
import { Button } from '@workspace/ui/components/button';

export default function BtxRpaDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxRpasId = parseInt(id, 10);
    const { data: btxRpas, isLoading } = useBtxRpa(btxRpasId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!btxRpas) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BtxRpa не найден</h1>
                    <Button onClick={() => router.push('/btx-rpas')}>
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
                    onClick={() => router.push('/btx-rpas')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <BtxRpaCard
                item={btxRpas}
                onEdit={() => router.push(`/btx-rpas/${btxRpas.id}/edit`)}
                onDelete={() => router.push(`/btx-rpas/${btxRpas.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
