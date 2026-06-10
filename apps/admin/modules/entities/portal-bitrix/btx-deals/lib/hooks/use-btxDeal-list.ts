'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BtxDealResponseDto } from '@workspace/nest-api';
import { useBtxDeals, useDeleteBtxDeal } from './use-btxDeals';
import {
    getUrlToBtxDeal,
    getUrlToEditBtxDeal,
    getUrlToNewBtxDeal,
} from '../utils/get-url-util';

export const useBtxDealList = (portalId?: number) => {
    const router = useRouter();
    const { data, isLoading } = useBtxDeals({
        portal_id: portalId || null,
    });
    const deleteBtxDeal = useDeleteBtxDeal();

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [btxDealToDelete, setBtxDealToDelete] = React.useState<number | null>(null);

    const btxDeals = Array.isArray(data) ? data : [];

    const handleRowClick = React.useCallback(
        (btxDeal: BtxDealResponseDto) => {
            router.push(getUrlToBtxDeal(portalId, btxDeal.id));
        },
        [portalId, router]
    );

    const handleEdit = React.useCallback(
        (btxDeal: BtxDealResponseDto) => {
            router.push(getUrlToEditBtxDeal(portalId, btxDeal.id));
        },
        [portalId, router]
    );

    const handleDelete = React.useCallback((btxDeal: BtxDealResponseDto) => {
        setBtxDealToDelete(btxDeal.id);
        setDeleteDialogOpen(true);
    }, []);

    const handleCreate = React.useCallback(() => {
        router.push(getUrlToNewBtxDeal(portalId));
    }, [portalId, router]);

    const confirmDelete = React.useCallback(() => {
        if (!btxDealToDelete) return;

        deleteBtxDeal.mutate(btxDealToDelete, {
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setBtxDealToDelete(null);
            },
        });
    }, [btxDealToDelete, deleteBtxDeal]);

    return {
        btxDeals,
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

