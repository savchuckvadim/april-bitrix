'use client';

import { useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
    APP_SETTINGS_TEXT,
    PORTAL_APP_TITLE,
} from '../../../consts/app-settings.const';
import { useSavePortalAppSettings } from '../../../lib/hooks/use-app-settings';
import {
    buildGroupViews,
    normalizeSettingsQuery,
} from '../../../lib/settings-view';
import type {
    PortalAppSettingsBlock,
    PortalAppSettingValue,
} from '../../../model';
import { AppSettingsGroupSection } from './AppSettingsGroupSection';

interface AppSettingsBlockProps {
    portalId: number;
    block: PortalAppSettingsBlock;
    /** Строка поиска панели: пусто — все категории свёрнуты. */
    query: string;
}

/**
 * Блок одного приложения: категории из схемы бэка (сворачиваемые секции),
 * локальный черновик изменений, «Сохранить» шлёт только изменённые ключи
 * (null = сброс). При поиске блок без совпадений не показывается.
 */
export const AppSettingsBlock = ({
    portalId,
    block,
    query,
}: AppSettingsBlockProps) => {
    const [draft, setDraft] = useState<
        Record<string, PortalAppSettingValue>
    >({});
    const save = useSavePortalAppSettings();
    const hasChanges = Object.keys(draft).length > 0;
    const searching = normalizeSettingsQuery(query).length > 0;
    const views = useMemo(() => buildGroupViews(block, query), [block, query]);

    if (searching && views.length === 0) return null;

    const onSave = () =>
        save.mutate(
            { portalId, appCode: block.appCode, values: draft },
            { onSuccess: () => setDraft({}) },
        );

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                    {PORTAL_APP_TITLE[block.appCode]}
                    {block.settings.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                            настроено{' '}
                            {
                                block.settings.filter(
                                    descriptor => descriptor.value !== null,
                                ).length
                            }{' '}
                            из {block.settings.length}
                        </span>
                    )}
                </CardTitle>
                {block.settings.length > 0 && (
                    <Button
                        size="sm"
                        disabled={!hasChanges || save.isPending}
                        onClick={onSave}
                    >
                        {save.isPending
                            ? APP_SETTINGS_TEXT.saving
                            : APP_SETTINGS_TEXT.save}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                {block.settings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {APP_SETTINGS_TEXT.empty}
                    </p>
                ) : (
                    views.map(view => (
                        <AppSettingsGroupSection
                            key={view.group.code}
                            portalId={portalId}
                            view={view}
                            searching={searching}
                            draft={draft}
                            // Ключ черновика — snake_case code настройки.
                            onChange={(code, value) =>
                                setDraft(current => ({
                                    ...current,
                                    [code]: value,
                                }))
                            }
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
};
