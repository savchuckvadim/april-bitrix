'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { InfoblockListItem } from '../../model';
import { useInfoblocks, useDeleteInfoblockWithConfirm, useInfoblockSearch } from '../../lib/hooks';
import { InfoblockTable } from '../infoblock-table/InfoblockTable';
import { INFOBLOCK_PATH } from '../../consts/infoblock.consts';
import { InfoblockSearchFilter } from './components';
import { Button } from '@workspace/ui/components';
import { PlusIcon } from 'lucide-react';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';

const path = INFOBLOCK_PATH;

export function InfoblockList() {
    const router = useRouter();
    const { data: infoblocks, isLoading } = useInfoblocks();
    const {
        deleteDialogOpen,
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
        isDeleting,
    } = useDeleteInfoblockWithConfirm();
    const { filters, setFilters, filteredInfoblocks } = useInfoblockSearch(infoblocks);

    const handleRowClick = (infoblock: InfoblockListItem) => {
        router.push(`${path}/${infoblock.id}`);
    };

    const handleEdit = (infoblock: InfoblockListItem) => {
        router.push(`${path}/${infoblock.id}/edit`);
    };

    const handleCreate = () => {
        router.push(`${path}/new`);
    };

    const handleDelete = (infoblock: InfoblockListItem) => {
        openDeleteDialog(infoblock.id);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Infoblocks</h1>
                <Button variant="outline" size="sm" onClick={handleCreate}>
                    <PlusIcon className="w-4 h-4" /> Создать инфоблок</Button>
            </div>

            <InfoblockSearchFilter filters={filters} onFiltersChange={setFilters} />

            <InfoblockTable
                data={filteredInfoblocks}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={closeDeleteDialog}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот инфоблок? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />
        </div>
    );
}
