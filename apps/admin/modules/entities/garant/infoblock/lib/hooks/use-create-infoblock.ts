'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { InfoblockHelper } from '../api/infoblock-helper';
import { InfoblockCreateDto, InfoblockDetail } from '../../model';

const helper = new InfoblockHelper();

export const useCreateInfoblock = () => {
    const queryClient = useQueryClient();

    const createInfoblock = useMutation<InfoblockDetail, Error, InfoblockCreateDto>({
        mutationFn: async (dto: InfoblockCreateDto) => {

            const response = await helper.create(dto);

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['infoblocks'] });
        },
    });

    const createInfoblockAsync = (data: InfoblockCreateDto) => {
        return createInfoblock.mutate(data);
    };
    return {
        ...createInfoblock,
        createInfoblockAsync
    };
};
