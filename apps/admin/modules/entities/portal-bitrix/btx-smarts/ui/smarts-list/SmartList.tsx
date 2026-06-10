'use client';

import { useSmartList } from '../../lib/hooks';
import { SmartTable } from '../smarts-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';

export function SmartList({ portalId }: { portalId?: number | undefined }) {
    const {
        smarts,
        isLoading,
        deleteDialogOpen,
        setDeleteDialogOpen,
        handleRowClick,
        handleEdit,
        handleDelete,
        handleCreate,
        confirmDelete,
    } = useSmartList(portalId);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Smarts</h1>
                <Button onClick={handleCreate}>
                    Создать smart
                </Button>
            </div>

            <SmartTable
                data={smarts}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот smart? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
