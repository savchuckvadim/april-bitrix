'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/index';
import { ConfirmDialog } from '@/modules/shared';
import { GetRegionResponseDto } from '@workspace/nest-admin-api';
import { useDeleteRegion, useRegions } from '../../lib/hooks/use-regions';
import { RegionTable } from '../regions-table';

export function RegionList() {
    const router = useRouter();
    const { data: regionses, isLoading } = useRegions();
    const deleteRegion = useDeleteRegion();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [regionsToDelete, setRegionToDelete] = React.useState<number | null>(null);

    const handleRowClick = (regions: GetRegionResponseDto) => {
        router.push(`/regions/${regions.id}`);
    };

    const handleEdit = (regions: GetRegionResponseDto) => {
        router.push(`/regions/${regions.id}/edit`);
    };

    const handleDelete = (regions: GetRegionResponseDto) => {
        setRegionToDelete(Number(regions.id));
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (regionsToDelete) {
            deleteRegion.mutate(regionsToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setRegionToDelete(null);
                },
            });
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Regions</h1>
                <Button onClick={() => router.push('/regions/new')}>
                    Создать region
                </Button>
            </div>

            <RegionTable
                data={Array.isArray(regionses) ? regionses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот region? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </>
    );
}
