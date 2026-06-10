'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { InfoblockRelationsHelper } from '../api/infoblock-relations-helper';
import { InfoblockExcludedSetDto, InfoblockGroupSetDto } from '../../model';

const helper = new InfoblockRelationsHelper();


export const useSetInfoblockExcluded = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfoblockExcludedSetDto,
        Error,
        { id: string; dto: InfoblockExcludedSetDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.setExcluded(id, dto);
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

export const useSetInfoblockGroup = () => {
    const queryClient = useQueryClient();

    return useMutation<
        InfoblockGroupSetDto,
        Error,
        { id: string; dto: InfoblockGroupSetDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await helper.setGroup(id, dto);
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

