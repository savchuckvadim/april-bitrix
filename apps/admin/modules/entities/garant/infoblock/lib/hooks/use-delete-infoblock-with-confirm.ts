'use client';

import * as React from 'react';
import { useDeleteInfoblock } from './use-delete-infoblock';

/**
 * Хук для управления удалением инфоблока с подтверждением
 * Инкапсулирует логику открытия/закрытия диалога и выполнения удаления
 */
export function useDeleteInfoblockWithConfirm() {
    const deleteInfoblock = useDeleteInfoblock();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [infoblockToDelete, setInfoblockToDelete] = React.useState<string | null>(null);

    /**
     * Открывает диалог подтверждения удаления для указанного инфоблока
     */
    const openDeleteDialog = React.useCallback((infoblockId: string) => {
        setInfoblockToDelete(infoblockId);
        setDeleteDialogOpen(true);
    }, []);

    /**
     * Закрывает диалог подтверждения удаления
     */
    const closeDeleteDialog = React.useCallback(() => {
        setDeleteDialogOpen(false);
        setInfoblockToDelete(null);
    }, []);

    /**
     * Подтверждает и выполняет удаление инфоблока
     */
    const confirmDelete = React.useCallback(() => {
        if (infoblockToDelete) {
            deleteInfoblock.mutate(infoblockToDelete, {
                onSuccess: () => {
                    closeDeleteDialog();
                },
            });
        }
    }, [infoblockToDelete, deleteInfoblock, closeDeleteDialog]);

    return {
        // Состояние
        deleteDialogOpen,
        infoblockToDelete,
        isDeleting: deleteInfoblock.isPending,

        // Методы
        openDeleteDialog,
        closeDeleteDialog,
        confirmDelete,
    };
}
