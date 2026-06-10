'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBtxRpas, useDeleteBtxRpa } from '../../lib/hooks';
import { BtxRpaTable } from '../../ui/btxRpas-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { BtxRpaResponseDto } from '@workspace/nest-api';

export function BtxRpaList() {
    const router = useRouter();
    const { data: btxRpases, isLoading } = useBtxRpas();
    const deleteBtxRpa = useDeleteBtxRpa();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [btxRpasToDelete, setBtxRpaToDelete] = React.useState<number | null>(null);

    const handleRowClick = (btxRpas: BtxRpaResponseDto) => {
        router.push(`/btx-rpas/${btxRpas.id}`);
    };

    const handleEdit = (btxRpas: BtxRpaResponseDto) => {
        router.push(`/btx-rpas/${btxRpas.id}/edit`);
    };

    const handleDelete = (btxRpas: BtxRpaResponseDto) => {
        setBtxRpaToDelete(btxRpas.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (btxRpasToDelete) {
            deleteBtxRpa.mutate(btxRpasToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBtxRpaToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BtxRpas</h1>
                <Button onClick={() => router.push('/btx-rpas/new')}>
                    Создать btxrpa
                </Button>
            </div>

            <BtxRpaTable
                data={Array.isArray(btxRpases) ? btxRpases : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот btxrpa? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
