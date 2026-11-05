'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AdminAiFindPageParams, AiAdminPageDto } from '@workspace/nest-admin-api';
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
 * Страница AI-записей (свежие первыми) — для списков админки: все записи
 * разом вешали вкладку браузера (05.11.2026). Прошлая страница держится,
 * пока грузится следующая.
 */
export const useAiPage = (params: AdminAiFindPageParams, enabled = true) => {
    return useQuery<AiAdminPageDto, Error>({
        queryKey: [AI_LIST_CACHE_KEY, 'page', params],
        queryFn: async () => helper.page(params),
        placeholderData: keepPreviousData,
        enabled,
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
