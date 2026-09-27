'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { VendorSuperUsersHelper } from '../api/vendor-super-users-helper';
import type { VendorSuperUserSave } from '../../model';

const helper = new VendorSuperUsersHelper();
const KEY = ['portal-vendor-super-users'] as const;

/** Суперпользователи April на портале, включая снятых с доступа. */
export const useVendorSuperUsers = (portalId?: number) =>
    useQuery({
        queryKey: [...KEY, portalId],
        queryFn: () => helper.list(portalId as number),
        enabled: !!portalId,
    });

/** Завести доступ или обновить существующий (тот же bitrixId). */
export const useSaveVendorSuperUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { portalId: number; payload: VendorSuperUserSave }) =>
            helper.save(vars.portalId, vars.payload),
        onSuccess: (_data, vars) => {
            toast.success('Доступ сохранён');
            void qc.invalidateQueries({ queryKey: [...KEY, vars.portalId] });
        },
        onError: error =>
            toast.error('Не удалось сохранить доступ', {
                description: getApiErrorMessage(error),
            }),
    });
};

/** Убрать доступ совсем (в отличие от снятия флага «активен»). */
export const useRemoveVendorSuperUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { portalId: number; bitrixId: number }) =>
            helper.remove(vars.portalId, vars.bitrixId),
        onSuccess: (_data, vars) => {
            toast.success('Доступ убран');
            void qc.invalidateQueries({ queryKey: [...KEY, vars.portalId] });
        },
        onError: error =>
            toast.error('Не удалось убрать доступ', {
                description: getApiErrorMessage(error),
            }),
    });
};
