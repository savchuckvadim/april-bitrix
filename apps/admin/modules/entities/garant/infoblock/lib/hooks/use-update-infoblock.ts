'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    InfoblockDetail,
    InfoblockCreateDto,
} from '../../model';
import { InfoblockHelper } from '../api/infoblock-helper';

const helper = new InfoblockHelper();

export const useUpdateInfoblock = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfoblockDetail,
        Error,
        { id: string; dto: InfoblockCreateDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.update(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['infoblocks'] });
            queryClient.invalidateQueries({
                queryKey: ['infoblock', variables.id],
            });
        },
    });
};
