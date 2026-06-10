'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTimezones, useDeleteTimezone } from '../../lib/hooks';
import { TimezoneTable } from '../../ui/timezones-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { TimezoneResponseDto } from '@workspace/nest-api';

export function TimezoneList() {
    const router = useRouter();
    const { data: timezoneses, isLoading } = useTimezones();
    const deleteTimezone = useDeleteTimezone();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [timezonesToDelete, setTimezoneToDelete] = React.useState<number | null>(null);

    const handleRowClick = (timezones: TimezoneResponseDto) => {
        router.push(`/timezones/${timezones.id}`);
    };

    const handleEdit = (timezones: TimezoneResponseDto) => {
        router.push(`/timezones/${timezones.id}/edit`);
    };

    const handleDelete = (timezones: TimezoneResponseDto) => {
        setTimezoneToDelete(timezones.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (timezonesToDelete) {
            deleteTimezone.mutate(timezonesToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setTimezoneToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Timezones</h1>
                <Button onClick={() => router.push('/timezones/new')}>
                    Создать timezone
                </Button>
            </div>

            <TimezoneTable
                data={Array.isArray(timezoneses) ? timezoneses : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот timezone? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
