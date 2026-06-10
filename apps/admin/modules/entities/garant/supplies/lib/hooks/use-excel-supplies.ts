'use client';

import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { AdminGarantSupplyUploadExcelBody } from '../../model';
import { SuppliesHelper } from '../api/supplies-helper';

const helper = new SuppliesHelper();

/**
 * Хук для скачивания примера Excel файла
 */
export const useDownloadExcelExample = () => {
    return useMutation<Blob, Error>({
        mutationFn: async () => {
            const response = await helper.downLoadExcelExample();
            return response;
        },
        onSuccess: (blob) => {
            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'supplies-example.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
    });
};

/**
 * Хук для загрузки Excel файла
 */
export const useUploadExcel = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, AdminGarantSupplyUploadExcelBody>({
        mutationFn: async (dto: AdminGarantSupplyUploadExcelBody) => {
            const response = await helper.upLoadExcel(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplies'] });
        },
    });
};

/**
 * Хук для обновления данных из Excel
 */
export const useUpdateByExcel = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error>({
        mutationFn: async () => {
            const response = await helper.updateByExcel();
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplies'] });
        },
    });
};
