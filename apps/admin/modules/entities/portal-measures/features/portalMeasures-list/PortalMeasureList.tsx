'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { usePortalMeasures, useDeletePortalMeasure } from '../../lib/hooks';
import { PortalMeasureTable } from '../../ui/portalMeasures-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { PortalMeasureResponseDto } from '@workspace/nest-api';

export function PortalMeasureList() {
    const router = useRouter();
    const { data: portalMeasureses, isLoading } = usePortalMeasures();
    const deletePortalMeasure = useDeletePortalMeasure();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [portalMeasuresToDelete, setPortalMeasureToDelete] = React.useState<number | null>(null);

    const handleRowClick = (portalMeasures: PortalMeasureResponseDto) => {
        router.push(`/portal-measures/${portalMeasures.id}`);
    };

    const handleEdit = (portalMeasures: PortalMeasureResponseDto) => {
        router.push(`/portal-measures/${portalMeasures.id}/edit`);
    };

    const handleDelete = (portalMeasures: PortalMeasureResponseDto) => {
        setPortalMeasureToDelete(portalMeasures.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (portalMeasuresToDelete) {
            deletePortalMeasure.mutate(portalMeasuresToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPortalMeasureToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">PortalMeasures</h1>
                <Button onClick={() => router.push('/portal-measures/new')}>
                    Создать portalmeasure
                </Button>
            </div>

            <PortalMeasureTable
                data={Array.isArray(portalMeasureses) ? portalMeasureses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот portalmeasure? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
