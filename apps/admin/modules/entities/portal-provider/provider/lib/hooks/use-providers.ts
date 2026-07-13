'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ProviderHelper } from '../api/provider-helper';
import type { CreateProviderWithRq, UpdateRq } from '../../model';

const helper = new ProviderHelper();
const KEY = ['providers'] as const;

/** Поставщики портала с реквизитами по домену. */
export const useProvidersByDomain = (domain?: string) =>
    useQuery({
        queryKey: [...KEY, domain],
        queryFn: () => helper.getByDomain(domain as string),
        enabled: !!domain,
    });

/** Справочники select`ов поставщика (типы). */
export const useProviderEnums = () =>
    useQuery({
        queryKey: ['provider-enums'],
        queryFn: () => helper.getEnums(),
    });

/** Создать поставщика с реквизитами. */
export const useCreateProvider = (domain?: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: CreateProviderWithRq) => helper.create(dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, domain] }),
    });
};

/** Обновить реквизиты поставщика по id rq. */
export const useUpdateRq = (domain?: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { id: number; dto: UpdateRq }) =>
            helper.updateRq(vars.id, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, domain] }),
    });
};

/** Удалить поставщика вместе с реквизитами. */
export const useDeleteProvider = (domain?: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => helper.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, domain] }),
    });
};
