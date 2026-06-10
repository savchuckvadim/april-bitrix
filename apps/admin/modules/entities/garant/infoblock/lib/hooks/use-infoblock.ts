'use client';

import { useQuery } from '@tanstack/react-query';
import {
    InfoblockListItem,

    InfoblockDetail,
} from '../../model';
import { InfoblockHelper } from '../api/infoblock-helper';

const helper = new InfoblockHelper();

export const useInfoblocks = () => {
    return useQuery<InfoblockListItem[], Error>({
        queryKey: ['infoblocks'],
        queryFn: async () => {
            const response = await helper.list();
            
            return response;
        },
    });
};

export const useInfoblock = (id: string) => {
    return useQuery<InfoblockDetail, Error>({
        queryKey: ['infoblock', id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useInfoblockByCode = (code: string) => {
    return useQuery<InfoblockDetail, Error>({
        queryKey: ['infoblock', 'code', code],
        queryFn: async () => {
            const response = await helper.getByCode(code);
            return response;
        },
        enabled: !!code,
    });
};
