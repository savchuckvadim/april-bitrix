'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMeasures, useDeleteMeasure } from '../../lib/hooks';
import { MeasureTable } from '../../ui/measures-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { MeasureResponseDto } from '@workspace/nest-api';

export function MeasureList() {
    const router = useRouter();
    const { data: measureses, isLoading } = useMeasures();
    const deleteMeasure = useDeleteMeasure();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [measuresToDelete, setMeasureToDelete] = React.useState<number | null>(null);

    const handleRowClick = (measures: MeasureResponseDto) => {
        router.push(`/measures/${measures.id}`);
    };

    const handleEdit = (measures: MeasureResponseDto) => {
        router.push(`/measures/${measures.id}/edit`);
    };

    const handleDelete = (measures: MeasureResponseDto) => {
        setMeasureToDelete(measures.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (measuresToDelete) {
            deleteMeasure.mutate(measuresToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setMeasureToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Measures</h1>
                <Button onClick={() => router.push('/measures/new')}>
                    Создать measure
                </Button>
            </div>

            <MeasureTable
                data={Array.isArray(measureses) ? measureses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот measure? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
