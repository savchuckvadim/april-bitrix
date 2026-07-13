'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PortalKeysHelper } from '../api/portal-keys-helper';
import type { PortalKeyName } from '../../model';

const helper = new PortalKeysHelper();
const KEY = ['portal-keys'] as const;

/** Все ключи портала (расшифрованные). */
export const usePortalKeys = (portalId?: number) =>
    useQuery({
        queryKey: [...KEY, portalId],
        queryFn: () => helper.getAll(portalId as number),
        enabled: !!portalId,
    });

/** Задать/обновить значение ключа портала. */
export const useSetPortalKey = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            portalId: number;
            keyName: PortalKeyName;
            value: string;
        }) => helper.set(vars.portalId, vars.keyName, vars.value),
        onSuccess: (_data, vars) =>
            qc.invalidateQueries({ queryKey: [...KEY, vars.portalId] }),
    });
};

/** Очистить ключ портала. */
export const useRemovePortalKey = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { portalId: number; keyName: PortalKeyName }) =>
            helper.remove(vars.portalId, vars.keyName),
        onSuccess: (_data, vars) =>
            qc.invalidateQueries({ queryKey: [...KEY, vars.portalId] }),
    });
};
