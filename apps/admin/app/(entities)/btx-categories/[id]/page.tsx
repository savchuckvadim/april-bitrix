'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxCategorie } from '@/modules/entities/btx-categories/lib/hooks';
import { BtxCategorieCard } from '@/modules/entities/btx-categories/ui/btxCategories-card';
import { Button } from '@workspace/ui/components/button';

export default function BtxCategorieDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxCategoriesId = parseInt(id, 10);
    const { data: btxCategories, isLoading } = useBtxCategorie(btxCategoriesId);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (!btxCategories) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">BtxCategorie не найден</h1>
                    <Button onClick={() => router.push('/btx-categories')}>
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
                    onClick={() => router.push('/btx-categories')}
                >
                    ← Назад к списку
                </Button>
            </div>
            <BtxCategorieCard
                item={btxCategories}
                onEdit={() => router.push(`/btx-categories/${btxCategories.id}/edit`)}
                onDelete={() => router.push(`/btx-categories/${btxCategories.id}/delete`)}
                onViewDetails={() => {}}
            />
        </div>
    );
}
