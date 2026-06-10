'use client';

import { useQuery } from '@tanstack/react-query';
import { AiEntity } from '../../model';
import { AiHelper } from '../api/ai-helper';
import { AI_LIST_CACHE_KEY } from '../../consts/ai.consts';

const helper = new AiHelper();

/**
 * Хук для получения всех AI записей
 */
export const useAi = () => {
    return useQuery<AiEntity[], Error>({
        queryKey: [AI_LIST_CACHE_KEY],
        queryFn: async () => {
            const response = await helper.list();
            return response;
        },
        // select: (data) => data.map((item) => ({
        //     ...item,

        //     createdAt: new Date(item.createdAt),
        //     updatedAt: new Date(item.updatedAt),
        // })),

    });
};

/**
 * Хук для получения AI записей по домену (порталу)
 */
export const useAiByDomain = (domain: string) => {
    return useQuery<AiEntity[], Error>({
        queryKey: [AI_LIST_CACHE_KEY, 'domain', domain],
        queryFn: async () => {
            const response = await helper.findByDomain(domain);
            return response;
        },
        enabled: !!domain,
    });
};

/**
 * Хук для получения AI записей по домену и пользователю
 */
export const useAiByDomainAndUser = (domain: string, userId: string) => {
    return useQuery<AiEntity[], Error>({
        queryKey: [AI_LIST_CACHE_KEY, 'domain', domain, 'user', userId],
        queryFn: async () => {
            const response = await helper.findByDomainAndUser(domain, userId);
            return response;
        },
        enabled: !!domain && !!userId,
    });
};

/**
 * Хук для получения одной AI записи по ID
 */
export const useAiById = (id: string) => {
    return useQuery<AiEntity, Error>({
        queryKey: [AI_LIST_CACHE_KEY, id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};
