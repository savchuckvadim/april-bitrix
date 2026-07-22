'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../../../lib/api-error';
import type { SmartName, TypedGroup } from '../../../../lib/model/common';
import { SmartProcessHelper } from '../../../process/lib/api/smart-process-helper';
import { SmartsAdminHelper } from '../api/smarts-admin-helper';

const adminHelper = new SmartsAdminHelper();
const processHelper = new SmartProcessHelper();

/** Общий префикс ключей кэша смартов портала (список + детали). */
export const DB_SMARTS_KEY = ['pbx-db-smarts'] as const;

/** ВСЕ смарты портала одним запросом; фильтрация выполняется на клиенте. */
export const usePortalDbSmarts = (portalId: number) =>
    useQuery({
        queryKey: [...DB_SMARTS_KEY, 'list', portalId],
        queryFn: () => adminHelper.getPortalSmarts(portalId),
        enabled: Number.isFinite(portalId) && portalId > 0,
    });

/**
 * Детали смарта (строка БД + живое состояние Bitrix). Хук монтируется только
 * в раскрытой строке, поэтому запрос уходит лениво при первом раскрытии, а
 * повторные раскрытия читаются из кэша TanStack Query по id смарта.
 */
export const useSmartDetails = (smartId: number) =>
    useQuery({
        queryKey: [...DB_SMARTS_KEY, 'details', smartId],
        queryFn: () => adminHelper.getDetails(smartId),
        staleTime: 60_000,
        // Bitrix отвечает permission-ошибкой мгновенно и стабильно —
        // ретраи только множат одинаковые запросы к порталу.
        retry: false,
    });

/** Идемпотентная установка смарта «AI-анализ звонков» на портал по домену. */
export const useInstallAicall = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (domain: string) => adminHelper.installAicall(domain),
        onSuccess: () => {
            toast.success('Смарт «AI-анализ звонков» установлен');
            void queryClient.invalidateQueries({ queryKey: DB_SMARTS_KEY });
        },
        onError: (e) => toast.error(getApiErrorMessage(e)),
    });
};

/** Полная установка смарта по эталону (pbx-install): тип + поля + воронки. */
export const useReinstallSmart = (domain?: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { name: SmartName; group: TypedGroup }) =>
            processHelper.installSmart(domain as string, vars.name, vars.group),
        onSuccess: () => {
            toast.success('Смарт установлен');
            void queryClient.invalidateQueries({ queryKey: DB_SMARTS_KEY });
            void queryClient.invalidateQueries({
                queryKey: ['pbx-process', 'smart'],
            });
        },
        onError: (e) => toast.error(getApiErrorMessage(e)),
    });
};
