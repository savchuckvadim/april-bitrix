'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBtxContacts, useDeleteBtxContact } from '../../lib/hooks';
import { BtxContactTable } from '../../ui/btxContacts-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { BtxContactResponseDto } from '@workspace/nest-api';

export function BtxContactList() {
    const router = useRouter();
    const { data: btxContactses, isLoading } = useBtxContacts();
    const deleteBtxContact = useDeleteBtxContact();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [btxContactsToDelete, setBtxContactToDelete] = React.useState<number | null>(null);

    const handleRowClick = (btxContacts: BtxContactResponseDto) => {
        router.push(`/btx-contacts/${btxContacts.id}`);
    };

    const handleEdit = (btxContacts: BtxContactResponseDto) => {
        router.push(`/btx-contacts/${btxContacts.id}/edit`);
    };

    const handleDelete = (btxContacts: BtxContactResponseDto) => {
        setBtxContactToDelete(btxContacts.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (btxContactsToDelete) {
            deleteBtxContact.mutate(btxContactsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBtxContactToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BtxContacts</h1>
                <Button onClick={() => router.push('/btx-contacts/new')}>
                    Создать btxcontact
                </Button>
            </div>

            <BtxContactTable
                data={Array.isArray(btxContactses) ? btxContactses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот btxcontact? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
