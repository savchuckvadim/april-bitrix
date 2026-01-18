'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSmart } from '@/modules/entities/smarts/lib/hooks';
import { SmartCard } from '@/modules/entities/smarts/ui/smarts-card';
import { Button } from '@workspace/ui/components/button';

export default function SmartDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const smartsId = parseInt(id, 10);
    const { data: smarts, isLoading } = useSmart(smartsId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!smarts) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Smart не найден</h1>
                    <Button onClick={() => router.push('/smarts')}>
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
                    onClick={() => router.push('/smarts')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <SmartCard
                item={smarts}
                onEdit={() => router.push(`/smarts/${smarts.id}/edit`)}
                onDelete={() => router.push(`/smarts/${smarts.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
