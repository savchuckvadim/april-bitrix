'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBxRq } from '@/modules/entities/bx-rqs/lib/hooks';
import { BxRqCard } from '@/modules/entities/bx-rqs/ui/bxRqs-card';
import { Button } from '@workspace/ui/components/button';

export default function BxRqDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const bxRqsId = parseInt(id, 10);
    const { data: bxRqs, isLoading } = useBxRq(bxRqsId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!bxRqs) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BxRq не найден</h1>
                    <Button onClick={() => router.push('/bx-rqs')}>
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
                    onClick={() => router.push('/bx-rqs')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <BxRqCard
                item={bxRqs}
                onEdit={() => router.push(`/bx-rqs/${bxRqs.id}/edit`)}
                onDelete={() => router.push(`/bx-rqs/${bxRqs.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
