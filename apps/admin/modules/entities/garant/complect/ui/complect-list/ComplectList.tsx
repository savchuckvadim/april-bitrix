'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, } from '@workspace/ui/index';
import { ConfirmDialog } from '@/modules/shared/ui/';
import { GetComplectResponseDto } from '@workspace/nest-admin-api';
import { useComplects } from '../../lib/hooks';
import { ComplectTable } from '../complect-table/ComplectTable';
import { COMPLECT_PATH } from '../../consts/complect.consts';
const path = COMPLECT_PATH;
export function ComplectList() {
    const router = useRouter();
    const { data: complects, isLoading } = useComplects();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [complectToDelete, setComplectToDelete] = React.useState<string | null>(null);

    const handleRowClick = (complect: GetComplectResponseDto) => {
        router.push(`${path}/${complect.id}`);
    };

    const handleEdit = (complect: GetComplectResponseDto) => {
        router.push(`${path}/${complect.id}/edit`);
    };

    const handleDelete = (complect: GetComplectResponseDto) => {
        setComplectToDelete(complect.id as string);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (complectToDelete) {
            // TODO: Добавьте логику удаления
            setDeleteDialogOpen(false);
            setComplectToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Complects</h1>
                <Button onClick={() => router.push(`${path}/new`)}>
                    Создать complect
                </Button>
            </div>

            <ComplectTable
                data={Array.isArray(complects) ? complects : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот complect? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
