'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { AiSettingsHelper } from '../api/ai-settings-helper';
import type { PortalAiSettingsUpdate } from '../../model';

const helper = new AiSettingsHelper();
const KEY = ['portal-ai-settings'] as const;

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
        onSuccess: (_data, vars) => {
            toast.success('Настройки AI портала сохранены');
            void qc.invalidateQueries({
                queryKey: [...KEY, vars.portalId],
            });
        },
        onError: (error) =>
            toast.error('Не удалось сохранить настройки', {
                description: getApiErrorMessage(error),
            }),
    });
};
