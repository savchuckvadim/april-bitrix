'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog, ExcelManager } from '@/modules/shared/ui';
import { GetSupplyResponseDto } from '@workspace/nest-api';
import { useSupplies, useDownloadExcelExample, useUploadExcel, useUpdateByExcel } from '../../lib/hooks';
import { SuppliesTable } from '../supplies-table/SuppliesTable';
const path = '/garant/supplies';
export function SuppliesList() {
    const router = useRouter();
    const { data: supplies, isLoading } = useSupplies();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [supplyToDelete, setSupplyToDelete] = React.useState<string | null>(null);

    const downloadExample = useDownloadExcelExample();
    const uploadExcel = useUploadExcel();
    const updateByExcel = useUpdateByExcel();
    const handleRowClick = (supply: GetSupplyResponseDto) => {
        router.push(`${path}/${supply.id}`);
    };

    const handleEdit = (supply: GetSupplyResponseDto) => {
        router.push(`${path}/${supply.id}/edit`);
    };

    const handleDelete = (supply: GetSupplyResponseDto) => {
        setSupplyToDelete(supply.id.toString());
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (supplyToDelete) {
            // TODO: Добавьте логику удаления
            setDeleteDialogOpen(false);
            setSupplyToDelete(null);
        }
    };

    const handleUploadExcel = (file: File) => {
        uploadExcel.mutate({ file });
    };

    const handleUpdateByExcel = () => {
        updateByExcel.mutate();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Supplies</h1>
                <div className="flex items-center gap-2">
                    <ExcelManager
                        onDownloadExample={() => downloadExample.mutate()}
                        onUploadExcel={handleUploadExcel}
                        onUpdateByExcel={handleUpdateByExcel}
                        isDownloading={downloadExample.isPending}
                        isUploading={uploadExcel.isPending}
                        isUpdating={updateByExcel.isPending}
                    />
                    <Button onClick={() => router.push(`${path}/new`)}>
                        Создать supply
                    </Button>
                </div>
            </div>

            <SuppliesTable
                data={Array.isArray(supplies) ? supplies : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот supply? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
