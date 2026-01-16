'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useBtxCategorie, useUpdateBtxCategorie } from '@/modules/entities/btx-categories/lib/hooks';
import { BtxCategorieForm } from '@/modules/entities/btx-categories/ui/btxCategories-form';
import { UpdateBtxCategoryDto } from '@workspace/nest-api';
import { Button } from '@workspace/ui/components/button';

export default function EditBtxCategoriePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const btxCategoriesId = parseInt(id, 10);
    const { data: btxCategories, isLoading } = useBtxCategorie(btxCategoriesId);
    const updateBtxCategorie = useUpdateBtxCategorie();

    const handleSubmit = (data: UpdateBtxCategoryDto) => {
        updateBtxCategorie.mutate(
            { id: btxCategoriesId, dto: data },
            {
                onSuccess: () => {
                    router.push(`/btx-categories/${btxCategoriesId}`);
                },
            },
        );
    };

    const handleCancel = () => {
        router.push(`/btx-categories/${btxCategoriesId}`);
    };

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
            <BtxCategorieForm
                mode="edit"
                initialData={btxCategories as UpdateBtxCategoryDto}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={updateBtxCategorie.isPending}
            />
        </div>
    );
}
