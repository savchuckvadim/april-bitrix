'use client';

import { APP_SETTINGS_TEXT } from '../../consts/app-settings.const';
import { usePortalAppSettings } from '../../lib/hooks/use-app-settings';
import { AppSettingsBlock } from './components/AppSettingsBlock';

interface PortalAppSettingsPanelProps {
    portalId: number;
}

/**
 * Панель «Настройки приложений» карточки портала: блоки по приложениям
 * из реестра бэка (PORTAL_APP_SETTINGS_SCHEMA) — названия, описания,
 * типы и дефолты приходят с сервера, фронт ничего не хардкодит.
 */
export const PortalAppSettingsPanel = ({
    portalId,
}: PortalAppSettingsPanelProps) => {
    const { data, isLoading, isError } = usePortalAppSettings(portalId);

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Загрузка…</p>;
    }
    if (isError || !data) {
        return (
            <p className="text-sm text-destructive">
                {APP_SETTINGS_TEXT.loadError}
            </p>
        );
    }

    return (
        <div className="grid max-w-3xl gap-4">
            {data.apps.map(block => (
                <AppSettingsBlock
                    key={block.appCode}
                    portalId={portalId}
                    block={block}
                />
            ))}
        </div>
    );
};
