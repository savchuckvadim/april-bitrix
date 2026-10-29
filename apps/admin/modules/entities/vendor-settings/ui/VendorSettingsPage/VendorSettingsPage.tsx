'use client';

import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import { useVendorSettings } from '../../lib/hooks/use-vendor-settings';
import { VENDOR_SETTINGS_TEXT } from '../../model';
import { VendorSettingGroupCard } from '../components/VendorSettingGroupCard';

/**
 * Раздел «Настройки приложения»: прокси за рубеж и ключи AI-сервисов уровня
 * April. Состав, описания и инструкции приходят с бэка — фронт показывает
 * группы и даёт сохранить или очистить каждое значение отдельно.
 */
export const VendorSettingsPage = () => {
    const query = useVendorSettings();

    if (query.isLoading) {
        return (
            <p className="text-sm text-muted-foreground">{VENDOR_SETTINGS_TEXT.loading}</p>
        );
    }
    if (query.isError || !query.data) {
        return (
            <HookNotice
                tone="error"
                title={VENDOR_SETTINGS_TEXT.loadError}
                message={getApiErrorMessage(query.error)}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">{VENDOR_SETTINGS_TEXT.title}</h1>
                <p className="text-sm text-muted-foreground">{VENDOR_SETTINGS_TEXT.intro}</p>
            </div>
            {query.data.groups.map((group) => (
                <VendorSettingGroupCard
                    key={group.group}
                    group={group}
                    secretMask={query.data.secretMask}
                />
            ))}
        </div>
    );
};
