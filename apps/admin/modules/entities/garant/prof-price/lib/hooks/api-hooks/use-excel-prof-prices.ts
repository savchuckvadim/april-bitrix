'use client';

import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { ProfPriceUploadExcelDto } from '@/modules/entities/garant/prof-price/model';
import { ProfPricesHelper } from '@/modules/entities/garant/prof-price/lib/api/prof-prices.helper';
import { PROF_PRICE_QUERY_KEY } from '@/modules/entities/garant/prof-price/consts/prof-price.consts';

const helper = new ProfPricesHelper();

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
            link.download = 'prof-prices-example.xlsx';
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

    return useMutation<any, Error, ProfPriceUploadExcelDto>({
        mutationFn: async (dto: ProfPriceUploadExcelDto) => {
            const response = await helper.upLoadExcel(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROF_PRICE_QUERY_KEY] });
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
            queryClient.invalidateQueries({ queryKey: [PROF_PRICE_QUERY_KEY] });
        },
    });
};
