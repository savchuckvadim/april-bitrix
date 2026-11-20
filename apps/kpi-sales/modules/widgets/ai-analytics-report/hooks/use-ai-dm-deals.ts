'use client';

import { useCallback, useMemo, useState } from 'react';
import { fetchAiDealMovementDeals } from '@/modules/entities/ai-analytics/lib/api/ai-deal-movement-helper';
import {
    AI_DM_DEALS_FILTER_DEFAULT,
    aiDmDealsQuery,
    aiDmWithManager,
    aiDmWithPage,
    aiDmWithPageSize,
    aiDmWithStatuses,
} from '../lib/deal-movement/ai-deal-movement-deals.util';
import { aiDmManagerIdsOfKey } from '../lib/deal-movement/ai-deal-movement-query.util';
import { useAiDmRequest, useAiDmRequester } from './use-ai-dm-request';

/**
 * Проблемные сделки последней ночи: фильтр «менеджер», «статус» и
 * страница живут здесь, отбор и порядок — на сервере. Без выбранного
 * менеджера список ограничен менеджерами фильтра отчёта.
 *
 * @param scopeManagerKey менеджеры фильтра отчёта строкой (из обзора)
 */
export const useAiDmDeals = (scopeManagerKey: string) => {
    const requester = useAiDmRequester();
    const [filter, setFilter] = useState(AI_DM_DEALS_FILTER_DEFAULT);

    const request = useMemo(
        () =>
            requester
                ? {
                      requester,
                      query: aiDmDealsQuery(filter, aiDmManagerIdsOfKey(scopeManagerKey)),
                  }
                : null,
        [requester, filter, scopeManagerKey],
    );

    const state = useAiDmRequest(request, fetchAiDealMovementDeals);

    const setManager = useCallback(
        (value: string | null) => setFilter(prev => aiDmWithManager(prev, value)),
        [],
    );
    const setStatuses = useCallback(
        (values: string[]) => setFilter(prev => aiDmWithStatuses(prev, values)),
        [],
    );
    const setPage = useCallback(
        (page: number) => setFilter(prev => aiDmWithPage(prev, page)),
        [],
    );
    const setPageSize = useCallback(
        (pageSize: number) => setFilter(prev => aiDmWithPageSize(prev, pageSize)),
        [],
    );
    const reset = useCallback(() => setFilter(AI_DM_DEALS_FILTER_DEFAULT), []);

    return {
        ...state,
        filter,
        setManager,
        setStatuses,
        setPage,
        setPageSize,
        reset,
    };
};

export type AiDmDealsState = ReturnType<typeof useAiDmDeals>;
