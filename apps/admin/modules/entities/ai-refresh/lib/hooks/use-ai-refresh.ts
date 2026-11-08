'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AiRefreshPortalsDto } from '@workspace/nest-admin-api';
import { AI_REFRESH_POLL_MS } from '../../consts/ai-refresh.const';
import { AiRefreshHelper, type AiRefreshStartInput } from '../api/ai-refresh-helper';

export const aiRefreshHelper = new AiRefreshHelper();
const KEY = ['ai-refresh'] as const;
const stateKey = (domain: string | undefined) => [...KEY, 'state', domain ?? ''];
const PORTALS_KEY = [...KEY, 'portals'];

const anyRunning = (data: AiRefreshPortalsDto | undefined): boolean =>
    data?.portals.some(item => item.scenario && !item.scenario.finished) ??
    false;

/** Сценарий портала; опрос — пока он идёт. */
export const useAiRefreshState = (domain: string | undefined) =>
    useQuery({
        queryKey: stateKey(domain),
        queryFn: () => aiRefreshHelper.state(domain as string),
        enabled: !!domain,
        refetchInterval: query => {
            const scenario = query.state.data?.scenario;
            return scenario && !scenario.finished ? AI_REFRESH_POLL_MS : false;
        },
        refetchIntervalInBackground: false,
        retry: false,
    });

/** «Обновить всё» на портале: ответ сразу кладётся в кэш состояния. */
export const useStartAiRefresh = (domain: string | undefined) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: AiRefreshStartInput) =>
            aiRefreshHelper.start(domain as string, input),
        onSuccess: result => {
            qc.setQueryData(stateKey(domain), {
                domain: result.scenario.domain,
                scenario: result.scenario,
            });
            void qc.invalidateQueries({ queryKey: PORTALS_KEY });
        },
    });
};

/** Все порталы с AI-аналитикой; опрос — пока хоть один сценарий идёт. */
export const useAiRefreshPortals = () =>
    useQuery({
        queryKey: PORTALS_KEY,
        queryFn: () => aiRefreshHelper.portals(),
        refetchInterval: query =>
            anyRunning(query.state.data) ? AI_REFRESH_POLL_MS : false,
        refetchIntervalInBackground: false,
        retry: false,
    });

/** «Обновить все порталы». */
export const useStartAiRefreshAll = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: AiRefreshStartInput) =>
            aiRefreshHelper.startAll(input),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
