'use client';

import { useState } from 'react';
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
import type {
    PortalAppSettingsBlock,
    PortalAppSettingValue,
} from '../../../model';
import { AppSettingField } from './AppSettingField';

interface AppSettingsBlockProps {
    portalId: number;
    block: PortalAppSettingsBlock;
}

/**
 * Блок одного приложения: поля из схемы бэка, локальный черновик
 * изменений, «Сохранить» шлёт только изменённые ключи (null = сброс).
 */
export const AppSettingsBlock = ({
    portalId,
    block,
}: AppSettingsBlockProps) => {
    const [draft, setDraft] = useState<
        Record<string, PortalAppSettingValue>
    >({});
    const save = useSavePortalAppSettings();
    const hasChanges = Object.keys(draft).length > 0;

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
            <CardContent className="space-y-4">
                {block.settings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {APP_SETTINGS_TEXT.empty}
                    </p>
                ) : (
                    block.settings.map(descriptor => {
                        // Ключ черновика = camelCase-ключ схемы. Бэк отдаёт
                        // snake_case code — маппинг ключа формы делаем по нему.
                        const key = descriptor.code;
                        return (
                            <AppSettingField
                                key={key}
                                descriptor={descriptor}
                                draft={draft[key]}
                                onChange={value =>
                                    setDraft(current => ({
                                        ...current,
                                        [key]: value,
                                    }))
                                }
                            />
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};
