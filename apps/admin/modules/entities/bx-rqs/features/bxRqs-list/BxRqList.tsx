'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBxRqs, useDeleteBxRq } from '../../lib/hooks';
import { BxRqTable } from '../../ui/bxRqs-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { BxRqResponseDto } from '@workspace/nest-api';

export function BxRqList() {
    const router = useRouter();
    const { data: bxRqses, isLoading } = useBxRqs();
    const deleteBxRq = useDeleteBxRq();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [bxRqsToDelete, setBxRqToDelete] = React.useState<number | null>(null);

    const handleRowClick = (bxRqs: BxRqResponseDto) => {
        router.push(`/bx-rqs/${bxRqs.id}`);
    };

    const handleEdit = (bxRqs: BxRqResponseDto) => {
        router.push(`/bx-rqs/${bxRqs.id}/edit`);
    };

    const handleDelete = (bxRqs: BxRqResponseDto) => {
        setBxRqToDelete(bxRqs.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (bxRqsToDelete) {
            deleteBxRq.mutate(bxRqsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBxRqToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BxRqs</h1>
                <Button onClick={() => router.push('/bx-rqs/new')}>
                    Создать bxrq
                </Button>
            </div>

            <BxRqTable
                data={Array.isArray(bxRqses) ? bxRqses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот bxrq? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
