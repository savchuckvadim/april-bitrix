'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
    AdminAiFindPageParams,
    AiAdminFacetsDto,
    AiAdminPageDto,
} from '@workspace/nest-admin-api';
import { AiEntity } from '../../model';
import { AiHelper } from '../api/ai-helper';
import { AI_LIST_CACHE_KEY } from '../../consts/ai.consts';

const helper = new AiHelper();

/** Значения фильтров меняются медленно — пять минут без повторного запроса. */
const FACETS_STALE_MS = 5 * 60_000;

/**
 * Страница AI-записей (свежие первыми): фильтры — на сервере, длинные поля
 * укорочены. Все записи разом вешали вкладку браузера (05.11.2026). Прошлая
 * страница держится, пока грузится следующая.
 */
export const useAiPage = (params: AdminAiFindPageParams) => {
    return useQuery<AiAdminPageDto, Error>({
        queryKey: [AI_LIST_CACHE_KEY, 'page', params],
        queryFn: () => helper.page(params),
        placeholderData: keepPreviousData,
    });
};

/** Значения для фильтров списка: по всем порталам или по одному. */
export const useAiFacets = (domain?: string) => {
    return useQuery<AiAdminFacetsDto, Error>({
        queryKey: [AI_LIST_CACHE_KEY, 'facets', domain ?? ''],
        queryFn: () => helper.facets(domain),
        staleTime: FACETS_STALE_MS,
    });
};

/** Одна AI-запись целиком — для карточки. */
export const useAiById = (id: string) => {
    return useQuery<AiEntity, Error>({
        queryKey: [AI_LIST_CACHE_KEY, id],
        queryFn: () => helper.get(id),
        enabled: !!id,
    });
};
