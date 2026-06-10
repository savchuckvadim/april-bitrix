'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { useProfPrice } from '@/modules/entities/garant/prof-price';
import { ProfPricesCard } from '@/modules/entities/garant/prof-price/ui/prof-prices-card/ProfPricesCard';
const path = '/garant/prof-prices';

export default function ProfPriceDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data: profPrice, isLoading } = useProfPrice(id);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!profPrice) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Prof Price не найден</h1>
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
            <ProfPricesCard
                item={profPrice}
                onEdit={() => router.push(`${path}/${profPrice.id}/edit`)}
                onDelete={() => router.push(`${path}/${profPrice.id}/delete`)}
                onViewDetails={() => { }}
            />
        </div>
    );
}
