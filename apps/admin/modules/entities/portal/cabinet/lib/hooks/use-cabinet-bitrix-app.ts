'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { CabinetBitrixAppHelper } from '../api/cabinet-bitrix-app-helper';
import type { CabinetBitrixAppKeys } from '../../model';

const helper = new CabinetBitrixAppHelper();
const KEY = ['portal-cabinet-bitrix-app'] as const;

/** Подключение Битрикс24: адреса, ключи, установка, последнее обновление токена. */
export const useCabinetBitrixApp = (portalId: number) =>
    useQuery({
        queryKey: [...KEY, portalId],
        queryFn: () => helper.status(portalId),
    });

/** Внести ключи за клиента — следом перечитать состояние. */
export const useSaveCabinetBitrixAppKeys = (portalId: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (keys: CabinetBitrixAppKeys) => helper.saveKeys(portalId, keys),
        onSuccess: next => {
            toast.success('Ключи сохранены — проверьте подключение');
            qc.setQueryData([...KEY, portalId], next);
        },
        onError: error =>
            toast.error('Ключи не сохранены', {
                description: getApiErrorMessage(error),
            }),
    });
};

/** Проверка ключей пробным обновлением токена; итог — в ответе, не тостом. */
export const useCheckCabinetBitrixApp = (portalId: number) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => helper.check(portalId),
        onSettled: () => void qc.invalidateQueries({ queryKey: [...KEY, portalId] }),
        onError: error =>
            toast.error('Проверка не выполнена', {
                description: getApiErrorMessage(error),
            }),
    });
};
