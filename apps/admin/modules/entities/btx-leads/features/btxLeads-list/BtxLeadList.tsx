'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBtxLeads, useDeleteBtxLead } from '../../lib/hooks';
import { BtxLeadTable } from '../../ui/btxLeads-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { BtxLeadResponseDto } from '@workspace/nest-api';

export function BtxLeadList() {
    const router = useRouter();
    const { data: btxLeadses, isLoading } = useBtxLeads();
    const deleteBtxLead = useDeleteBtxLead();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [btxLeadsToDelete, setBtxLeadToDelete] = React.useState<number | null>(null);

    const handleRowClick = (btxLeads: BtxLeadResponseDto) => {
        router.push(`/btx-leads/${btxLeads.id}`);
    };

    const handleEdit = (btxLeads: BtxLeadResponseDto) => {
        router.push(`/btx-leads/${btxLeads.id}/edit`);
    };

    const handleDelete = (btxLeads: BtxLeadResponseDto) => {
        setBtxLeadToDelete(btxLeads.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (btxLeadsToDelete) {
            deleteBtxLead.mutate(btxLeadsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBtxLeadToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BtxLeads</h1>
                <Button onClick={() => router.push('/btx-leads/new')}>
                    Создать btxlead
                </Button>
            </div>

            <BtxLeadTable
                data={Array.isArray(btxLeadses) ? btxLeadses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот btxlead? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
