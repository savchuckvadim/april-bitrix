'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBitrixApps, useDeleteBitrixApp } from '../../lib/hooks';
import { BitrixAppTable } from '../../ui/bitrixApp-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { BitrixAppDto } from '@workspace/nest-api';

export function BitrixAppList() {
    const router = useRouter();
    const { data: bitrixApps, isLoading } = useBitrixApps();
    const deleteBitrixApp = useDeleteBitrixApp();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [bitrixAppToDelete, setBitrixAppToDelete] = React.useState<number | null>(null);

    const handleRowClick = (bitrixApp: BitrixAppDto) => {
        router.push(`/bitrix-app/${bitrixApp.id}`);
    };

    const handleEdit = (bitrixApp: BitrixAppDto) => {
        router.push(`/bitrix-app/${bitrixApp.id}/edit`);
    };

    const handleDelete = (bitrixApp: BitrixAppDto) => {
        setBitrixAppToDelete(Number(bitrixApp.id.toString()));
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (bitrixAppToDelete) {
            deleteBitrixApp.mutate(bitrixAppToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBitrixAppToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BitrixApps</h1>
                <Button onClick={() => router.push('/bitrix-app/new')}>
                    Создать bitrixapp
                </Button>
            </div>

            <BitrixAppTable
                data={Array.isArray(bitrixApps) ? bitrixApps : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот bitrixapp? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
