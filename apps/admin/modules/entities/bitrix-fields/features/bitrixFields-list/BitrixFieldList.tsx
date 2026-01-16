'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useBitrixFields, useDeleteBitrixField } from '../../lib/hooks';
import { BitrixFieldTable } from '../../ui/bitrixFields-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { BitrixFieldResponseDto } from '@workspace/nest-api';

export function BitrixFieldList() {
    const router = useRouter();
    const { data: bitrixFieldses, isLoading } = useBitrixFields();
    const deleteBitrixField = useDeleteBitrixField();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [bitrixFieldsToDelete, setBitrixFieldToDelete] = React.useState<number | null>(null);

    const handleRowClick = (bitrixFields: BitrixFieldResponseDto) => {
        router.push(`/bitrix-fields/${bitrixFields.id}`);
    };

    const handleEdit = (bitrixFields: BitrixFieldResponseDto) => {
        router.push(`/bitrix-fields/${bitrixFields.id}/edit`);
    };

    const handleDelete = (bitrixFields: BitrixFieldResponseDto) => {
        setBitrixFieldToDelete(bitrixFields.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (bitrixFieldsToDelete) {
            deleteBitrixField.mutate(bitrixFieldsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setBitrixFieldToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">BitrixFields</h1>
                <Button onClick={() => router.push('/bitrix-fields/new')}>
                    Создать bitrixfield
                </Button>
            </div>

            <BitrixFieldTable
                data={Array.isArray(bitrixFieldses) ? bitrixFieldses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот bitrixfield? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
