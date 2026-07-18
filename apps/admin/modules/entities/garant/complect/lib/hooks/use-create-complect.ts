'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    GetComplectResponseDto,
    CreateComplectDto,
} from '@workspace/nest-admin-api';
import { ComplectHelper } from '../api/complect-helper';

const helper = new ComplectHelper();


export const useCreateComplect = () => {
    const queryClient = useQueryClient();

    return useMutation<GetComplectResponseDto, Error, CreateComplectDto>({
        mutationFn: async (dto: CreateComplectDto) => {
            const response = await helper.create(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complects'] });
        },
    });
};
