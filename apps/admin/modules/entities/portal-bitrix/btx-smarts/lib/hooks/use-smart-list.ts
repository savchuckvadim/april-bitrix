'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SmartResponseDto } from '@workspace/nest-api';
import { useSmarts, useDeleteSmart } from './use-smarts';
import {
    getUrlToSmart,
    getUrlToEditSmart,
    getUrlToNewSmart,
} from '../utils/get-url-util';

export const useSmartList = (portalId?: number) => {
    const router = useRouter();
    const { data, isLoading } = useSmarts(portalId);
    const deleteSmart = useDeleteSmart();

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [smartToDelete, setSmartToDelete] = React.useState<number | null>(null);

    const smarts = Array.isArray(data) ? data : [];

    const handleRowClick = React.useCallback(
        (smart: SmartResponseDto) => {
            router.push(getUrlToSmart(portalId, smart.id));
        },
        [portalId, router]
    );

    const handleEdit = React.useCallback(
        (smart: SmartResponseDto) => {
            router.push(getUrlToEditSmart(portalId, smart.id));
        },
        [portalId, router]
    );

    const handleDelete = React.useCallback((smart: SmartResponseDto) => {
        setSmartToDelete(smart.id);
        setDeleteDialogOpen(true);
    }, []);

    const handleCreate = React.useCallback(() => {
        router.push(getUrlToNewSmart(portalId));
    }, [portalId, router]);

    const confirmDelete = React.useCallback(() => {
        if (!smartToDelete) return;

        deleteSmart.mutate(smartToDelete, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSmartToDelete(null);
            },
        });
    }, [smartToDelete, deleteSmart]);

    return {
        smarts,
        isLoading,
        deleteDialogOpen,
        setDeleteDialogOpen,
        handleRowClick,
        handleEdit,
        handleDelete,
        handleCreate,
        confirmDelete,
    };
};
