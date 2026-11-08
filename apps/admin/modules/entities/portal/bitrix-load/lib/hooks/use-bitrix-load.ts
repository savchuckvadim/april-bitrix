'use client';

import { useQuery } from '@tanstack/react-query';
import { BitrixLoadHelper } from '../api/bitrix-load-helper';

const helper = new BitrixLoadHelper();

/**
 * Обращения April к Битриксу портала за окно. Метрики Prometheus — сам
 * Битрикс не вызывается; кэш 5 минут, без повторов (недоступный Prometheus
 * отвечает `available: false`, а не ошибкой).
 */
export const usePortalBitrixLoad = (portalId: number, hours: number) =>
    useQuery({
        queryKey: ['portal-bitrix-load', portalId, hours],
        queryFn: () => helper.get(portalId, hours),
        staleTime: 300_000,
        retry: false,
    });
