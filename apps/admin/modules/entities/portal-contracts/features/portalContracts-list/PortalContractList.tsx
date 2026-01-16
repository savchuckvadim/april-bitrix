'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { usePortalContracts, useDeletePortalContract } from '../../lib/hooks';
import { PortalContractTable } from '../../ui/portalContracts-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { PortalContractResponseDto } from '@workspace/nest-api';

export function PortalContractList() {
    const router = useRouter();
    const { data: portalContractses, isLoading } = usePortalContracts();
    const deletePortalContract = useDeletePortalContract();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [portalContractsToDelete, setPortalContractToDelete] = React.useState<number | null>(null);

    const handleRowClick = (portalContracts: PortalContractResponseDto) => {
        router.push(`/portal-contracts/${portalContracts.id}`);
    };

    const handleEdit = (portalContracts: PortalContractResponseDto) => {
        router.push(`/portal-contracts/${portalContracts.id}/edit`);
    };

    const handleDelete = (portalContracts: PortalContractResponseDto) => {
        setPortalContractToDelete(portalContracts.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (portalContractsToDelete) {
            deletePortalContract.mutate(portalContractsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPortalContractToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">PortalContracts</h1>
                <Button onClick={() => router.push('/portal-contracts/new')}>
                    Создать portalcontract
                </Button>
            </div>

            <PortalContractTable
                data={Array.isArray(portalContractses) ? portalContractses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот portalcontract? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
