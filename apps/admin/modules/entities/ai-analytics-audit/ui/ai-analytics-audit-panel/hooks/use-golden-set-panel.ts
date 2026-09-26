'use client';

import { useState } from 'react';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { isValidGoldenQuota } from '../../../lib/audit-months.util';
import {
    buildGoldenSetEntryView,
    buildGoldenSetRunView,
    parseGoldenQuota,
    sortGoldenSetEntries,
    type GoldenSetEntryView,
    type GoldenSetRunView,
} from '../../../lib/golden-set.util';
import {
    useGoldenSet,
    useRunGoldenSet,
} from '../../../lib/hooks/use-ai-analytics-audit';
import type { GoldenSetControls, GoldenSetFormState } from '../types';

/**
 * Логика блока «Надёжность оценщика»: набор отчётов согласия по домену,
 * квота пар (пусто — умолчание бэка) и запуск повторного прогона. Домен
 * общий с формой аудита; ответ запуска показывается только для домена,
 * по которому он запрошен — после смены портала чужой ответ не висит.
 */
export const useGoldenSetPanel = (domain: string | undefined) => {
    const [quotaRaw, setQuotaRaw] = useState('');
    const [requestedDomain, setRequestedDomain] = useState<
        string | undefined
    >(undefined);
    const list = useGoldenSet(domain);
    const run = useRunGoldenSet();

    const quota = parseGoldenQuota(quotaRaw);
    const isQuotaValid = quota === undefined || isValidGoldenQuota(quota);
    const isForCurrentDomain = !!domain && requestedDomain === domain;
    const runAvailable = list.data?.runAvailable ?? true;

    const start = () => {
        if (!domain || !isQuotaValid) return;
        setRequestedDomain(domain);
        run.mutate(quota === undefined ? { domain } : { domain, quota });
    };

    const entries: GoldenSetEntryView[] = list.data
        ? sortGoldenSetEntries(list.data.entries).map(buildGoldenSetEntryView)
        : [];
    const runView: GoldenSetRunView | null =
        isForCurrentDomain && run.data ? buildGoldenSetRunView(run.data) : null;
    const runErrorMessage =
        isForCurrentDomain && run.isError ? getApiErrorMessage(run.error) : null;
    const listErrorMessage = list.isError ? getApiErrorMessage(list.error) : null;

    const form: GoldenSetFormState = { quotaRaw, isQuotaValid };
    const controls: GoldenSetControls = {
        canRun: !!domain && isQuotaValid && runAvailable && !run.isPending,
        isRunning: run.isPending,
        run: start,
        canRefresh: !!domain && !list.isFetching,
        isRefreshing: list.isFetching,
        refresh: () => {
            void list.refetch();
        },
    };

    return {
        form,
        setQuotaRaw,
        controls,
        entries,
        skipped: list.data?.skipped ?? 0,
        hint: list.data?.hint ?? null,
        runAvailable,
        isListLoading: list.isLoading,
        listErrorMessage,
        runView,
        runErrorMessage,
    };
};
