'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { VendorSettingsHelper } from '../api/vendor-settings-helper';
import { VENDOR_SETTINGS_TEXT, type VendorSettingKey } from '../../model';

const helper = new VendorSettingsHelper();
export const VENDOR_SETTINGS_KEY = ['vendor-settings'] as const;
/** Чек-лист «Поставщики AI» зависит от прокси и ключей — после сохранения устаревает. */
const PROVIDERS_READINESS_KEY = ['portal-ai-providers-readiness'] as const;

/** Настройки приложения по группам. */
export const useVendorSettings = () =>
    useQuery({
        queryKey: VENDOR_SETTINGS_KEY,
        queryFn: () => helper.list(),
        staleTime: 30_000,
    });

/** Сохранить одну настройку (пусто/null — снять, маска — оставить секрет). */
export const useSaveVendorSetting = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { key: VendorSettingKey; value: string | null }) =>
            helper.save(vars.key, vars.value),
        onSuccess: () => {
            toast.success(VENDOR_SETTINGS_TEXT.saved);
            void qc.invalidateQueries({ queryKey: VENDOR_SETTINGS_KEY });
            void qc.invalidateQueries({ queryKey: PROVIDERS_READINESS_KEY });
        },
        onError: (error) =>
            toast.error(VENDOR_SETTINGS_TEXT.saveError, {
                description: getApiErrorMessage(error),
            }),
    });
};
