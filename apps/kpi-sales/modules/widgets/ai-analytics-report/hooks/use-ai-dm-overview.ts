'use client';

import { useMemo } from 'react';
import { useAppSelector } from '@/modules/app';
import { selectAiOverviewScope } from '@/modules/entities/ai-analytics';
import { fetchAiDealMovementOverview } from '@/modules/entities/ai-analytics/lib/api/ai-deal-movement-helper';
import {
    aiDmManagerIdsOfKey,
    aiDmOverviewQuery,
    aiDmScopeManagerKey,
} from '../lib/deal-movement/ai-deal-movement-query.util';
import { useAiDmRequest, useAiDmRequester } from './use-ai-dm-request';

/**
 * Обзор «Движения сделок» за период фильтра отчёта (как у остальной
 * витрины) и его менеджеров: статусы, динамика, матрица, честность.
 * Пересчёт отчёта не запускает — одна синхронная ручка.
 */
export const useAiDmOverview = () => {
    const requester = useAiDmRequester();
    const from = useAppSelector(
        state => selectAiOverviewScope(state)?.filters.from ?? null,
    );
    const to = useAppSelector(
        state => selectAiOverviewScope(state)?.filters.to ?? null,
    );
    const managerKey = useAppSelector(state =>
        aiDmScopeManagerKey(selectAiOverviewScope(state)?.filters),
    );

    const request = useMemo(() => {
        const query = aiDmOverviewQuery(from, to, aiDmManagerIdsOfKey(managerKey));
        return requester && query ? { requester, query } : null;
    }, [requester, from, to, managerKey]);

    const state = useAiDmRequest(request, fetchAiDealMovementOverview);

    return {
        ...state,
        /** Менеджеры фильтра отчёта — ими же ограничен список сделок. */
        managerKey,
        /** Период выбран и запрос ушёл. */
        hasRequest: request !== null,
    };
};

export type AiDmOverviewState = ReturnType<typeof useAiDmOverview>;
