'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RqHelper } from '../api/rq-helper';
import type {
    RqFieldTemplate,
    RqPresetCode,
    RqPresetTemplate,
} from '../../model';

const helper = new RqHelper();
const KEY = ['pbx-rq'] as const;

/** Состояние реквизитов на портале (пресеты + поля со статусами). */
export const useRqMonitoring = (domain?: string) =>
    useQuery({
        queryKey: [...KEY, 'monitoring', domain],
        queryFn: () => helper.getMonitoring(domain as string),
        enabled: !!domain,
    });

/** Эталон для предпросмотра перед установкой. */
export const useRqParse = () =>
    useQuery({
        queryKey: [...KEY, 'parse'],
        queryFn: () => helper.getParse(),
    });

/** Установить эталон целиком (пресеты + поля). */
export const useInstallRqAll = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (domain: string) => helper.installAll(domain),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Установить выбранные пресеты. */
export const useInstallRqPresets = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { domain: string; presets: RqPresetTemplate[] }) =>
            helper.installPresets(vars.domain, vars.presets),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Установить выбранные поля реквизита. */
export const useInstallRqFields = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { domain: string; fields: RqFieldTemplate[] }) =>
            helper.installFields(vars.domain, vars.fields),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Привязать bitrixId к пресету в БД (`bx_rqs`), Bitrix не меняется. */
export const useSetRqPresetBitrixId = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            domain: string;
            code: RqPresetCode;
            bitrixId: number;
        }) => helper.setPresetBitrixId(vars.domain, vars.code, vars.bitrixId),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить пресеты в Bitrix по bitrix-id. */
export const useDeleteRqPresets = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { domain: string; ids: number[] }) =>
            helper.deletePresets(vars.domain, vars.ids),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};

/** Удалить поля реквизита в Bitrix по id. */
export const useDeleteRqFields = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { domain: string; ids: number[] }) =>
            helper.deleteFields(vars.domain, vars.ids),
        onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
    });
};
