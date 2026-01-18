'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useContracts, useDeleteContract } from '../../lib/hooks';
import { ContractTable } from '../../ui/contracts-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { ContractResponseDto } from '@workspace/nest-api';

export function ContractList() {
    const router = useRouter();
    const { data: contractses, isLoading } = useContracts();
    const deleteContract = useDeleteContract();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [contractsToDelete, setContractToDelete] = React.useState<number | null>(null);

    const handleRowClick = (contracts: ContractResponseDto) => {
        router.push(`/contracts/${contracts.id}`);
    };

    const handleEdit = (contracts: ContractResponseDto) => {
        router.push(`/contracts/${contracts.id}/edit`);
    };

    const handleDelete = (contracts: ContractResponseDto) => {
        setContractToDelete(contracts.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (contractsToDelete) {
            deleteContract.mutate(contractsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setContractToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Contracts</h1>
                <Button onClick={() => router.push('/contracts/new')}>
                    Создать contract
                </Button>
            </div>

            <ContractTable
                data={Array.isArray(contractses) ? contractses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот contract? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
