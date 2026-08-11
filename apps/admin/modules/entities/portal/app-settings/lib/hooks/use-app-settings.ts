'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { AppSettingsHelper } from '../api/app-settings-helper';
import type { PortalAppCode, PortalAppSettingValue } from '../../model';

const helper = new AppSettingsHelper();
const KEY = ['portal-app-settings'] as const;

/** Настройки всех приложений портала (схема + значения — с бэка). */
export const usePortalAppSettings = (portalId?: number) =>
    useQuery({
        queryKey: [...KEY, portalId],
        queryFn: () => helper.list(portalId as number),
        enabled: !!portalId,
    });

/** Сохранить настройки одного приложения (null = сброс на дефолт). */
export const useSavePortalAppSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            portalId: number;
            appCode: PortalAppCode;
            values: Record<string, PortalAppSettingValue>;
        }) => helper.save(vars.portalId, vars.appCode, vars.values),
        onSuccess: (_data, vars) => {
            toast.success('Настройки приложения сохранены');
            void qc.invalidateQueries({ queryKey: [...KEY, vars.portalId] });
        },
        onError: error =>
            toast.error('Не удалось сохранить настройки', {
                description: getApiErrorMessage(error),
            }),
    });
};
