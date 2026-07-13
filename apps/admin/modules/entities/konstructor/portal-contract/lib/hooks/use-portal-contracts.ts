'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PortalContractHelper } from '../api/portal-contract-helper';
import type {
    PortalContract,
    PortalContractCreate,
    PortalContractForm,
    PortalContractUpdate,
} from '../../model';

const helper = new PortalContractHelper();
const KEY = ['portal-contracts'] as const;

/** Договоры портала (`portal_contracts`). */
export const usePortalContracts = (domain?: string) =>
    useQuery<PortalContract[], Error>({
        queryKey: [...KEY, domain],
        queryFn: () => helper.list(domain as string),
        enabled: !!domain,
    });

/** Select-опции связей для формы создания договора портала. */
export const usePortalContractForm = (domain?: string) =>
    useQuery<PortalContractForm, Error>({
        queryKey: [...KEY, 'form', domain],
        queryFn: () => helper.getForm(domain as string),
        enabled: !!domain,
    });

/** Создать договор портала (по `domain`). */
export const useCreatePortalContract = () => {
    const qc = useQueryClient();
    return useMutation<
        PortalContract,
        Error,
        { domain: string; dto: PortalContractCreate }
    >({
        mutationFn: (vars) => helper.create(vars.domain, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Частично обновить договор портала по id. */
export const useUpdatePortalContract = () => {
    const qc = useQueryClient();
    return useMutation<
        PortalContract,
        Error,
        { id: number; dto: PortalContractUpdate }
    >({
        mutationFn: (vars) => helper.update(vars.id, vars.dto),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить договор портала по id. */
export const useDeletePortalContract = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: (id) => helper.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
