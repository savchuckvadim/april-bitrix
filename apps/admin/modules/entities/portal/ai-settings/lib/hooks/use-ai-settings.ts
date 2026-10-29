'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { AiSettingsHelper } from '../api/ai-settings-helper';
import type { PortalAiSettingsUpdate } from '../../model';

const helper = new AiSettingsHelper();
const KEY = ['portal-ai-settings'] as const;
const PROVIDERS_KEY = ['portal-ai-providers-readiness'] as const;

/**
 * Чек-лист готовности провайдеров AI портала. С `probe` бэк дополнительно
 * проверяет связь с endpoint'ами — это отдельный ключ кэша, чтобы обычный
 * показ формы не ждал сетевых проверок.
 */
export const usePortalAiProvidersReadiness = (
    portalId: number | undefined,
    probe: boolean,
) =>
    useQuery({
        queryKey: [...PROVIDERS_KEY, portalId, probe],
        queryFn: () => helper.readiness(portalId as number, probe),
        enabled: !!portalId,
        staleTime: 30_000,
    });

/** Настройки AI портала (null в поле = действует глобальная настройка). */
export const usePortalAiSettings = (portalId?: number) =>
    useQuery({
        queryKey: [...KEY, portalId],
        queryFn: () => helper.get(portalId as number),
        enabled: !!portalId,
    });

/** Сохранить настройки AI портала (частичный PUT, null = сброс поля). */
export const useSavePortalAiSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            portalId: number;
            update: PortalAiSettingsUpdate;
        }) => helper.save(vars.portalId, vars.update),
        onSuccess: (data, vars) => {
            toast.success('Настройки AI портала сохранены');
            // Ответ PUT — уже актуальное состояние: кладём его в кэш сразу,
            // чтобы форма не мигала «несохранёнными изменениями» до refetch.
            qc.setQueryData([...KEY, vars.portalId], data);
            void qc.invalidateQueries({
                queryKey: [...KEY, vars.portalId],
            });
            // Порядок провайдеров и Whisper сменились — чек-лист устарел.
            void qc.invalidateQueries({
                queryKey: [...PROVIDERS_KEY, vars.portalId],
            });
        },
        onError: (error) =>
            toast.error('Не удалось сохранить настройки', {
                description: getApiErrorMessage(error),
            }),
    });
};
