'use client';

import { useBtxDealList } from '../../lib/hooks';
import { BtxDealTable } from '../btxDeals-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';

export function BtxDealList({ portalId }: { portalId?: number | undefined }) {
    const {
        btxDeals,
        isLoading,
        deleteDialogOpen,
        setDeleteDialogOpen,
        handleRowClick,
        handleEdit,
        handleDelete,
        handleCreate,
        confirmDelete,
    } = useBtxDealList(portalId);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BtxDeals</h1>
                <Button onClick={handleCreate}>
                    Создать btxdeal
                </Button>
            </div>

            <BtxDealTable
                data={btxDeals}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот btxdeal? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
