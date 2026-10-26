'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LogsHelper } from '../api/logs-helper';
import { toLogsParams } from '../logs-view';
import type { LogsFilter } from '../../model';

const helper = new LogsHelper();

export const LOGS_QUERY_KEY = ['logs'] as const;

/** Сводка с выводами по фильтру. */
export const useLogsSummary = (filter: LogsFilter) =>
    useQuery({
        queryKey: [...LOGS_QUERY_KEY, 'summary', toLogsParams(filter)],
        queryFn: () => helper.summary(filter),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });

/** Последние строки журнала по фильтру. */
export const useLogRows = (filter: LogsFilter, limit: number) =>
    useQuery({
        queryKey: [...LOGS_QUERY_KEY, 'rows', toLogsParams(filter), limit],
        queryFn: () => helper.rows(filter, limit),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
    });
