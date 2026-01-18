'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBtxCompanies, useDeleteBtxCompanie } from '../../lib/hooks';
import { BtxCompanieTable } from '../../ui/btxCompanies-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { BtxCompanyResponseDto } from '@workspace/nest-api';

export function BtxCompanieList() {
    const router = useRouter();
    const { data: btxCompanieses, isLoading } = useBtxCompanies();
    const deleteBtxCompanie = useDeleteBtxCompanie();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [btxCompaniesToDelete, setBtxCompanieToDelete] = React.useState<number | null>(null);

    const handleRowClick = (btxCompanies: BtxCompanyResponseDto) => {
        router.push(`/btx-companies/${btxCompanies.id}`);
    };

    const handleEdit = (btxCompanies: BtxCompanyResponseDto) => {
        router.push(`/btx-companies/${btxCompanies.id}/edit`);
    };

    const handleDelete = (btxCompanies: BtxCompanyResponseDto) => {
        setBtxCompanieToDelete(btxCompanies.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (btxCompaniesToDelete) {
            deleteBtxCompanie.mutate(btxCompaniesToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBtxCompanieToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BtxCompanies</h1>
                <Button onClick={() => router.push('/btx-companies/new')}>
                    Создать btxcompanie
                </Button>
            </div>

            <BtxCompanieTable
                data={Array.isArray(btxCompanieses) ? btxCompanieses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот btxcompanie? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
