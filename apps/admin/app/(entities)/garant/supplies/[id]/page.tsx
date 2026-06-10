'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { useSupply } from '@/modules/entities/garant/supplies';
import { SuppliesCard } from '@/modules/entities/garant/supplies/ui/supplies-card/SuppliesCard';
const path = '/garant/supplies';

export default function SupplyDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: supply, isLoading } = useSupply(id);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!supply) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Supply не найден</h1>
                    <Button onClick={() => router.push(path)}>
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
                    onClick={() => router.push(path)}
                >
                    ← Назад к списку
                </Button>
            </div>
            <SuppliesCard
                item={supply}
                onEdit={() => router.push(`${path}/${supply.id}/edit`)}
                onDelete={() => router.push(`${path}/${supply.id}/delete`)}
                onViewDetails={() => { }}
            />
        </div>
    );
}
