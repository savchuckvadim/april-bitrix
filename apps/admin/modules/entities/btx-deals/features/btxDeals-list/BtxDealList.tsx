'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBtxDeals, useDeleteBtxDeal } from '../../lib/hooks';
import { BtxDealTable } from '../../ui/btxDeals-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { BtxDealResponseDto } from '@workspace/nest-api';

export function BtxDealList() {
    const router = useRouter();
    const { data: btxDealses, isLoading } = useBtxDeals();
    const deleteBtxDeal = useDeleteBtxDeal();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [btxDealsToDelete, setBtxDealToDelete] = React.useState<number | null>(null);

    const handleRowClick = (btxDeals: BtxDealResponseDto) => {
        router.push(`/btx-deals/${btxDeals.id}`);
    };

    const handleEdit = (btxDeals: BtxDealResponseDto) => {
        router.push(`/btx-deals/${btxDeals.id}/edit`);
    };

    const handleDelete = (btxDeals: BtxDealResponseDto) => {
        setBtxDealToDelete(btxDeals.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (btxDealsToDelete) {
            deleteBtxDeal.mutate(btxDealsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBtxDealToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BtxDeals</h1>
                <Button onClick={() => router.push('/btx-deals/new')}>
                    Создать btxdeal
                </Button>
            </div>

            <BtxDealTable
                data={Array.isArray(btxDealses) ? btxDealses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот btxdeal? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
