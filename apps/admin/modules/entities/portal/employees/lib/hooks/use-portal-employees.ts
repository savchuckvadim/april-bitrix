'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { PortalEmployeesHelper } from '../api/portal-employees-helper';

const helper = new PortalEmployeesHelper();
const KEY = ['portal-employees'] as const;
/** Совпадает с кэшем бэка: чаще спрашивать нет смысла. */
const STALE_MS = 10 * 60 * 1000;

/**
 * Сотрудники портала — один запрос на портал для всех полей выбора на
 * странице (react-query делит кэш по ключу).
 */
export const usePortalEmployees = (portalId?: number) =>
    useQuery({
        queryKey: [...KEY, portalId],
        queryFn: () => helper.list(portalId as number),
        enabled: !!portalId,
        staleTime: STALE_MS,
    });

/** «Обновить список»: бэк перечитывает Битрикс мимо своего кэша. */
export const useRefreshPortalEmployees = (portalId?: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => helper.list(portalId as number, true),
        onSuccess: employees => {
            qc.setQueryData([...KEY, portalId], employees);
        },
        onError: error =>
            toast.error('Не удалось обновить сотрудников', {
                description: getApiErrorMessage(error),
            }),
    });
};
