'use client'

import { PriceEntity } from '@/modules/entities/garant/prof-price/model';
import {
    useProfPrices,
    useDownloadExcelExample,
    useUploadExcel,
    useUpdateByExcel,
} from '@/modules/entities/garant/prof-price/lib/hooks';

import { useComplects } from '@/modules/entities/garant/complect';
import { useSupplies } from '@/modules/entities/garant/supplies';
import { PROF_PRICE_PATH } from '@/modules/entities/garant/prof-price/consts/prof-price.consts';
import { useRouter } from 'next/navigation';
import React from 'react';
const path = PROF_PRICE_PATH;


export function useProfPriceList() {
    const router = useRouter();
    const { data: profPrices, isLoading } = useProfPrices();
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [profPriceToDelete, setProfPriceToDelete] = React.useState<string | null>(null);
    const { data: complects } = useComplects();
    const { data: supplies } = useSupplies();


    const downloadExample = useDownloadExcelExample();
    const uploadExcel = useUploadExcel();
    const updateByExcel = useUpdateByExcel();

    const handleRowClick = (profPrice: PriceEntity) => {
        router.push(`${path}/${profPrice.id}`);
    };

    const handleEdit = (profPrice: PriceEntity) => {
        router.push(`${path}/${profPrice.id}/edit`);
    };

    const handleDelete = (profPrice: PriceEntity) => {
        setProfPriceToDelete(profPrice.id.toString());
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (profPriceToDelete) {
            // TODO: Добавьте логику удаления
            setDeleteDialogOpen(false);
            setProfPriceToDelete(null);
        }
    };

    const handleUploadExcel = (file: File) => {
        uploadExcel.mutate({ file });
    };

    const handleUpdateByExcel = () => {
        updateByExcel.mutate();
    };

    const toNew = () => {
        router.push(`${path}/new`);
    };

    return {
        profPrices,
        isLoading,
        deleteDialogOpen,
        profPriceToDelete,
        complects,
        supplies,
        handleRowClick,
        handleEdit,
        handleDelete,
        confirmDelete,
        handleUploadExcel,
        handleUpdateByExcel,
        toNew,
        setDeleteDialogOpen,
        downloadExample,
        uploadExcel,
        updateByExcel,


    };
}
