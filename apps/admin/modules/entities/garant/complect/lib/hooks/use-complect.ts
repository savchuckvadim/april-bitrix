'use client';

import { useQuery } from '@tanstack/react-query';
import {
    GetComplectResponseDto,

} from '@workspace/nest-api';
import { ComplectHelper } from '../api/complect-helper';

const helper = new ComplectHelper();



export const useComplect = (id: string) => {
    return useQuery<GetComplectResponseDto, Error>({
        queryKey: ['complect', id],
        queryFn: async () => {
            const response = await helper.get(id);

            return response;
        },
        enabled: !!id,
    });
};
