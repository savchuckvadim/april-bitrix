'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBitrixApps, useDeleteBitrixApp } from '../../lib/hooks';
import { BitrixAppTable } from '../../ui/bitrix-app-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';

export function BitrixAppList() {
    const router = useRouter();
    const { data: apps, isLoading } = useBitrixApps();
    const deleteApp = useDeleteBitrixApp();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [appToDelete, setAppToDelete] = React.useState<string | null>(null);

    const handleRowClick = (app: any) => {
        // router.push(`/admin/bitrix-apps/${app.id}`);
    };

    const handleEdit = (app: any) => {
        // router.push(`/admin/bitrix-apps/${app.id}/edit`);
    };

    const handleDelete = (app: any) => {
        setAppToDelete(app.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (appToDelete) {
            deleteApp.mutate(appToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setAppToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Bitrix приложения</h1>
                <Button onClick={() => router.push('/admin/bitrix-apps/new')}>
                    Создать приложение
                </Button>
            </div>

            <BitrixAppTable
                data={apps || []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить это приложение? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}

