'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSmarts, useDeleteSmart } from '../../lib/hooks';
import { SmartTable } from '../../ui/smarts-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { SmartResponseDto } from '@workspace/nest-api';

export function SmartList() {
    const router = useRouter();
    const { data: smartses, isLoading } = useSmarts();
    const deleteSmart = useDeleteSmart();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [smartsToDelete, setSmartToDelete] = React.useState<number | null>(null);

    const handleRowClick = (smarts: SmartResponseDto) => {
        router.push(`/smarts/${smarts.id}`);
    };

    const handleEdit = (smarts: SmartResponseDto) => {
        router.push(`/smarts/${smarts.id}/edit`);
    };

    const handleDelete = (smarts: SmartResponseDto) => {
        setSmartToDelete(smarts.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (smartsToDelete) {
            deleteSmart.mutate(smartsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSmartToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Smarts</h1>
                <Button onClick={() => router.push('/smarts/new')}>
                    Создать smart
                </Button>
            </div>

            <SmartTable
                data={Array.isArray(smartses) ? smartses : []}
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
