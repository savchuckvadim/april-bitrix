'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useClients, useDeleteClient } from '../../lib/hooks';
import { ClientTable } from '../../ui/client-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { ClientResponseDto } from '@workspace/nest-api';

export function ClientList() {
    debugger
    const router = useRouter();
    const { data: clients, isLoading } = useClients({
        is_active: 'true',
        status: 'active',
    });
    const deleteClient = useDeleteClient();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [clientToDelete, setClientToDelete] = React.useState<number | null>(null);

    const handleRowClick = (client: ClientResponseDto) => {
        router.push(`/client/${client.id}`);
    };

    const handleEdit = (client: ClientResponseDto) => {
        router.push(`/client/${client.id}/edit`);
    };

    const handleDelete = (client: ClientResponseDto) => {
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
                <h1 className="text-3xl font-bold">Clients</h1>
                <Button onClick={() => router.push('/client/new')}>
                    Создать client
                </Button>
            </div>

            <ClientTable
                data={Array.isArray(clients) ? clients : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот client? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
