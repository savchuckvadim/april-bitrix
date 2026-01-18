'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { usePortals, useDeletePortal } from '../../lib/hooks';
import { PortalTable } from '../../ui/portal-table';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui/confirm-dialog';
import { PortalResponseDto } from '@workspace/nest-api';

export function PortalList() {
    const router = useRouter();
    const { data: portals, isLoading } = usePortals();
    const deletePortal = useDeletePortal();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [portalToDelete, setPortalToDelete] = React.useState<number | null>(null);

    const handleRowClick = (portal: PortalResponseDto) => {
        router.push(`/portal/${portal.id}`);
    };

    const handleEdit = (portal: PortalResponseDto) => {
        router.push(`/portal/${portal.id}/edit`);
    };

    const handleDelete = (portal: PortalResponseDto) => {
        setPortalToDelete(portal.id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (portalToDelete) {
            deletePortal.mutate(portalToDelete, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setPortalToDelete(null);
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Portals</h1>
                <Button onClick={() => router.push('/portal/new')}>
                    Создать portal
                </Button>
            </div>

            <PortalTable
                data={Array.isArray(portals) ? portals : []}
                isLoading={isLoading}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Подтвердите удаление"
                description="Вы уверены, что хотите удалить этот portal? Это действие нельзя отменить."
                onConfirm={confirmDelete}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
