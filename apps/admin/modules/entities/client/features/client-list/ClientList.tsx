'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useClients, useDeleteClient } from '../../lib/hooks';
import { ClientTable } from '../../ui/client-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';

export function ClientList() {
    const router = useRouter();
    const { data: clients, isLoading } = useClients();
    const deleteClient = useDeleteClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [clientToDelete, setClientToDelete] =
        React.useState<number | null>(null);

    const handleRowClick = (client: any) => {
        router.push(`/admin/clients/${client.id}`);
    };

    const handleEdit = (client: any) => {
        router.push(`/admin/clients/${client.id}/edit`);
    };

    const handleDelete = (client: any) => {
        setClientToDelete(client.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (clientToDelete) {
            deleteClient.mutate(clientToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setClientToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Клиенты</h1>
                <Button onClick={() => router.push('/admin/clients/new')}>
                    Создать клиента
                </Button>
            </div>

            <ClientTable
                data={clients || []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этого клиента? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}

