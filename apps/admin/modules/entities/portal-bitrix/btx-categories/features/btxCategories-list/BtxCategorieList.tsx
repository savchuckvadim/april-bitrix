'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBtxCategories, useDeleteBtxCategorie } from '../../lib/hooks';
import { BtxCategorieTable } from '../../ui/btxCategories-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { PbxCategory, PbxGetCategoriesByEntityDto } from '../../model';

export function BtxCategoryList({ params }: { params: PbxGetCategoriesByEntityDto }) {
    const router = useRouter();
    const { data: btxCategorieses, isLoading } = useBtxCategories(params);
    const deleteBtxCategorie = useDeleteBtxCategorie();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [btxCategoriesToDelete, setBtxCategorieToDelete] = React.useState<number | null>(null);

    const handleRowClick = (btxCategories: PbxCategory) => {
        router.push(`/btx-categories/${btxCategories.id}`);
    };

    const handleEdit = (btxCategories: PbxCategory) => {
        router.push(`/btx-categories/${btxCategories.id}/edit`);
    };

    const handleDelete = (btxCategories: PbxCategory) => {
        setBtxCategorieToDelete(btxCategories.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (btxCategoriesToDelete) {
            deleteBtxCategorie.mutate(btxCategoriesToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBtxCategorieToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BtxCategories</h1>
                <Button onClick={() => router.push('/btx-categories/new')}>
                    Создать btxcategorie
                </Button>
            </div>

            <BtxCategorieTable
                data={Array.isArray(btxCategorieses) ? btxCategorieses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот btxcategorie? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
