'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { InfogroupResponseDto } from '../../model';
import { useInfoGroups } from '../../lib/hooks';
import { InfoGroupsTable } from '../info-groups-table/InfoGroupsTable';

export function InfoGroupsList() {
    const router = useRouter();
    const { data: infoGroups, isLoading } = useInfoGroups();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [infoGroupToDelete, setInfoGroupToDelete] = React.useState<string | null>(null);

    const handleRowClick = (infoGroup: InfogroupResponseDto) => {
        router.push(`/info-groups/${infoGroup.id}`);
    };

    const handleEdit = (infoGroup: InfogroupResponseDto) => {
        router.push(`/info-groups/${infoGroup.id}/edit`);
    };

    const handleDelete = (infoGroup: InfogroupResponseDto) => {
        setInfoGroupToDelete(infoGroup.id as string);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (infoGroupToDelete) {
            // TODO: Добавьте логику удаления
            setDeleteDialogOpen(false);
            setInfoGroupToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Info Groups</h1>
                <Button onClick={() => router.push('/info-groups/new')}>
                    Создать info group
                </Button>
            </div>

            <InfoGroupsTable
                data={Array.isArray(infoGroups) ? infoGroups : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот info group? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
