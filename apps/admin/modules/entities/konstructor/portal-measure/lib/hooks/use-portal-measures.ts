'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PortalMeasureHelper } from '../api/portal-measure-helper';
import type {
    PortalMeasure,
    PortalMeasureMonitoring,
    PortalMeasureSync,
    PortalMeasureUpdate,
} from '../../model';

const helper = new PortalMeasureHelper();
const KEY = ['portal-measures'] as const;

/** Единицы измерения портала (`portal_measure`). */
export const usePortalMeasures = (domain?: string) =>
    useQuery<PortalMeasure[], Error>({
        queryKey: [...KEY, domain],
        queryFn: () => helper.list(domain as string),
        enabled: !!domain,
    });

/** Сводка PortalDB ↔ Bitrix + глобальный справочник. */
export const usePortalMeasuresMonitoring = (domain?: string) =>
    useQuery<PortalMeasureMonitoring, Error>({
        queryKey: [...KEY, 'monitoring', domain],
        queryFn: () => helper.getMonitoring(domain as string),
        enabled: !!domain,
    });

/** Синхронизировать портальные единицы измерения с глобальными. */
export const useSyncPortalMeasures = () => {
    const qc = useQueryClient();
    return useMutation<PortalMeasureSync, Error, string>({
        mutationFn: (d: string) => helper.sync(d),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Частично обновить портальную единицу измерения по id. */
export const useUpdatePortalMeasure = () => {
    const qc = useQueryClient();
    return useMutation<
        PortalMeasure,
        Error,
        { id: number; dto: PortalMeasureUpdate }
    >({
        mutationFn: (vars) => helper.update(vars.id, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить портальную единицу измерения по id. */
export const useDeletePortalMeasure = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => helper.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
