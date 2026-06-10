'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    GetComplectResponseDto,
    CreateComplectDto,
} from '@workspace/nest-api';
import { ComplectHelper } from '../api/complect-helper';

const helper = new ComplectHelper();

export const useComplects = () => {
    return useQuery<GetComplectResponseDto[], Error>({
        queryKey: ['complects'],
        queryFn: async () => {
            const response = await helper.list();

            return response;
        },
    });
};
