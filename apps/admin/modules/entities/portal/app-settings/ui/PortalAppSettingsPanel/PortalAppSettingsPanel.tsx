'use client';

import { useState } from 'react';
import { Input } from '@workspace/ui/components/input';
import { APP_SETTINGS_TEXT } from '../../consts/app-settings.const';
import { usePortalAppSettings } from '../../lib/hooks/use-app-settings';
import { buildGroupViews } from '../../lib/settings-view';
import { AppSettingsBlock } from './components/AppSettingsBlock';

interface PortalAppSettingsPanelProps {
    portalId: number;
}

/**
 * Панель «Настройки приложений» карточки портала: блоки по приложениям
 * из реестра бэка (PORTAL_APP_SETTINGS_SCHEMA), внутри — категории.
 * Названия, описания, категории и ссылки приходят с сервера. Поиск — по
 * названию, коду и описанию настройки и по названию категории.
 */
export const PortalAppSettingsPanel = ({
    portalId,
}: PortalAppSettingsPanelProps) => {
    const { data, isLoading, isError } = usePortalAppSettings(portalId);
    const [query, setQuery] = useState('');

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

    const nothingFound =
        query.trim().length > 0 &&
        data.apps.every(block => buildGroupViews(block, query).length === 0);

    return (
        <div className="grid max-w-3xl gap-4">
            <Input
                type="search"
                value={query}
                placeholder={APP_SETTINGS_TEXT.searchPlaceholder}
                onChange={event => setQuery(event.target.value)}
            />
            {nothingFound && (
                <p className="text-sm text-muted-foreground">
                    {APP_SETTINGS_TEXT.nothingFound}
                </p>
            )}
            {data.apps.map(block => (
                <AppSettingsBlock
                    key={block.appCode}
                    portalId={portalId}
                    block={block}
                    query={query}
                />
            ))}
        </div>
    );
};
