'use client';

import { useQuery } from '@tanstack/react-query';
import {
    LAUNCH_POLL_MS,
    LAUNCH_STATUS_STALE_MS,
} from '../../consts/ai-analytics-launch.const';
import { DealMovementHelper } from '../api/deal-movement.helper';
import { AI_ANALYTICS_LAUNCH_KEY } from './use-ai-analytics-launch';

export const dealMovementHelper = new DealMovementHelper();

/**
 * Состояние движения сделок портала: опрос раз в 30 секунд, пока идёт
 * прогон (или ждём начатый отсюда); иначе — один раз при открытии.
 */
export const useDealMovementStatus = (
    domain: string | undefined,
    polling: boolean,
) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_LAUNCH_KEY, 'deal-movement', domain ?? ''],
        queryFn: () => dealMovementHelper.status(domain as string),
        enabled: !!domain,
        refetchInterval: polling ? LAUNCH_POLL_MS : false,
        refetchIntervalInBackground: false,
        staleTime: LAUNCH_STATUS_STALE_MS,
        retry: false,
    });

/**
 * Проверка записи в ленту: опрос раз в 30 секунд, пока проверка идёт
 * (или ждём начатую отсюда); иначе — один раз при открытии.
 */
export const useDealMovementProbeStatus = (
    domain: string | undefined,
    polling: boolean,
) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_LAUNCH_KEY, 'deal-movement-probe', domain ?? ''],
        queryFn: () => dealMovementHelper.probeStatus(domain as string),
        enabled: !!domain,
        refetchInterval: polling ? LAUNCH_POLL_MS : false,
        refetchIntervalInBackground: false,
        staleTime: LAUNCH_STATUS_STALE_MS,
        retry: false,
    });
