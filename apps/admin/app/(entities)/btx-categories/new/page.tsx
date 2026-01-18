'use client';

import { useRouter } from 'next/navigation';
import { BtxCategorieForm } from '@/modules/entities/btx-categories/ui/btxCategories-form';
import { useCreateBtxCategorie } from '@/modules/entities/btx-categories/lib/hooks';
import { CreateBtxCategoryDto, UpdateBtxCategoryDto } from '@workspace/nest-api';

export default function NewBtxCategoriePage() {
    const router = useRouter();
    const createBtxCategorie = useCreateBtxCategorie();

    const handleSubmit = (data: CreateBtxCategoryDto) => {
        createBtxCategorie.mutate(data, {
            onSuccess: () => {
                router.push('/btx-categories');
            },
        });
    };

    const handleCancel = () => {
        router.push('/btx-categories');
    };

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <BtxCategorieForm
                mode="create"
                onSubmit={(data: CreateBtxCategoryDto | UpdateBtxCategoryDto) => handleSubmit(data as CreateBtxCategoryDto)}
                onCancel={handleCancel}
                isLoading={createBtxCategorie.isPending}
            />
        </div>
    );
}
