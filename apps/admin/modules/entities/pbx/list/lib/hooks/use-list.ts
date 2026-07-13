'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListHelper } from '../api/list-helper';
import type { ListFieldTemplate, ListRow } from '../../model';

const helper = new ListHelper();
const KEY = ['pbx-list'] as const;

type ListKeyVars = { type: string; group: 'sales' | 'service' | 'general' };

/** Состояние списков на портале (списки + поля со статусами). */
export const useListMonitoring = (domain?: string) =>
    useQuery({
        queryKey: [...KEY, 'monitoring', domain],
        queryFn: () => helper.getMonitoring(domain as string),
        enabled: !!domain,
    });

/** Эталон для предпросмотра перед установкой. */
export const useListParse = () =>
    useQuery({
        queryKey: [...KEY, 'parse'],
        queryFn: () => helper.getParse(),
    });

/** Установить весь эталон (все шаблоны списков). */
export const useInstallAllLists = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (domain: string) => helper.installAll(domain),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Установить один список по его шаблону-источнику. */
export const useInstallList = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { domain: string; row: ListRow }) =>
            helper.installList(vars.domain, vars.row),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Установить выбранные поля списка (body-вариант). */
export const useInstallListFields = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            domain: string;
            list: ListKeyVars;
            fields: ListFieldTemplate[];
        }) => helper.installFields(vars.domain, vars.list, vars.fields),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить поля списка по code (PortalDB + Bitrix). */
export const useDeleteListFields = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            domain: string;
            list: ListKeyVars;
            codes: string[];
        }) => helper.deleteFields(vars.domain, vars.list, vars.codes),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить список (каскад в PortalDB, опционально инфоблок в Bitrix). */
export const useDeleteList = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            domain: string;
            list: ListKeyVars;
            withBitrix: boolean;
        }) => helper.deleteList(vars.domain, vars.list, vars.withBitrix),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};