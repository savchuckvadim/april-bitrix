'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    GetComplectResponseDto,
    CreateComplectDto,
} from '@workspace/nest-api';
import { ComplectHelper } from '../api/complect-helper';

const helper = new ComplectHelper();

export const useUpdateComplect = () => {
    const queryClient = useQueryClient();

    return useMutation<
        GetComplectResponseDto,
        Error,
        { id: string; dto: CreateComplectDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.update(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['complects'] });
            queryClient.invalidateQueries({
                queryKey: ['complect', variables.id],
            });
        },
    });
};
