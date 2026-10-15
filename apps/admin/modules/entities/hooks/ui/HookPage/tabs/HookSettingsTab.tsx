'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { ToneBadge } from '@workspace/april-ui/badges';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import {
    AppSettingField,
    PORTAL_APP_TITLE,
    usePortalAppSettings,
    useSavePortalAppSettings,
    type PortalAppCode,
    type PortalAppSettingValue,
} from '@/modules/entities/portal/app-settings';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { DataTable, type Column } from '@/modules/shared/ui/data-table';
import {
    HOOK_SETTING_ROLE_LABEL,
    HOOKS_TEXT,
} from '../../../consts/hooks.const';
import { HOOKS_QUERY_KEY } from '../../../lib/hooks';
import { buildHookSettingsForm } from '../../../lib/hook-settings-form';
import { formatSettingValue } from '../../../lib/hooks-view';
import type { HookCatalogEntry, HookSettingRef } from '../../../model';
import { HookNotice } from '../../components/HookNotice';

interface HookSettingsTabProps {
    entry: HookCatalogEntry;
    portalId: number | undefined;
}

const RoleBadge = ({ role }: Pick<HookSettingRef, 'role'>) => (
    <ToneBadge tone={role === 'gate' ? 'warning' : 'neutral'} variant="soft" size="sm">
        {HOOK_SETTING_ROLE_LABEL[role]}
    </ToneBadge>
);

const READONLY_COLUMNS: Column<HookSettingRef>[] = [
    {
        id: 'name',
        header: HOOKS_TEXT.settingName,
        cell: row => <span className="whitespace-normal">{row.name}</span>,
        className: 'w-64',
    },
    {
        id: 'code',
        header: HOOKS_TEXT.settingCode,
        cell: row => <code className="font-mono text-xs">{row.code}</code>,
        className: 'w-56',
    },
    {
        id: 'role',
        header: HOOKS_TEXT.settingRole,
        cell: row => <RoleBadge role={row.role} />,
        className: 'w-28',
    },
    {
        id: 'default',
        header: HOOKS_TEXT.settingDefault,
        cell: row => formatSettingValue(row.default),
        className: 'w-28',
    },
    {
        id: 'note',
        header: HOOKS_TEXT.settingNote,
        cell: row => <span className="whitespace-normal text-sm">{row.note}</span>,
    },
];

type DraftByApp = Partial<Record<PortalAppCode, Record<string, PortalAppSettingValue>>>;

/**
 * Настройки портала, которые читает хук. Без портала — справочник
 * (что за ключ, роль, дефолт, как используется). С порталом — те же поля,
 * что в «Настройках приложений», с действующими значениями: правятся и
 * сохраняются прямо здесь, после сохранения готовность хука перечитывается.
 */
export const HookSettingsTab = ({ entry, portalId }: HookSettingsTabProps) => {
    const appSettings = usePortalAppSettings(portalId);
    const save = useSavePortalAppSettings();
    const queryClient = useQueryClient();
    const [draft, setDraft] = useState<DraftByApp>({});
    const form = useMemo(
        () => buildHookSettingsForm(entry.settings, appSettings.data),
        [entry.settings, appSettings.data],
    );

    if (entry.settings.length === 0) {
        return (
            <SectionCard title={HOOKS_TEXT.settingsTitle}>
                <p className="text-sm text-muted-foreground">
                    {HOOKS_TEXT.settingsEmpty}
                </p>
            </SectionCard>
        );
    }

    if (!portalId) {
        return (
            <SectionCard
                title={HOOKS_TEXT.settingsTitle}
                description={HOOKS_TEXT.settingsNoPortalHint}
            >
                <DataTable data={entry.settings} columns={READONLY_COLUMNS} />
            </SectionCard>
        );
    }

    const onSave = (appCode: PortalAppCode) => {
        const values = draft[appCode];
        if (!values || Object.keys(values).length === 0) return;
        save.mutate(
            { portalId, appCode, values },
            {
                onSuccess: () => {
                    setDraft(current => ({ ...current, [appCode]: undefined }));
                    void queryClient.invalidateQueries({
                        queryKey: [...HOOKS_QUERY_KEY, 'portal', portalId],
                    });
                },
            },
        );
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {HOOKS_TEXT.settingsFormHint}{' '}
                <Link
                    href={`/portal/${portalId}/app-settings`}
                    className="text-primary underline underline-offset-2"
                >
                    {HOOKS_TEXT.openAppSettings}
                </Link>
            </p>

            {appSettings.isLoading && (
                <p className="text-sm text-muted-foreground">{HOOKS_TEXT.loading}</p>
            )}
            {appSettings.isError && (
                <HookNotice
                    tone="error"
                    title={HOOKS_TEXT.settingsLoadError}
                    message={getApiErrorMessage(appSettings.error)}
                />
            )}

            {form.groups.map(group => {
                const groupDraft = draft[group.appCode] ?? {};
                const hasChanges = Object.keys(groupDraft).length > 0;
                return (
                    <SectionCard
                        key={group.appCode}
                        title={`${HOOKS_TEXT.settingsTitle}: ${PORTAL_APP_TITLE[group.appCode] ?? group.appCode}`}
                        actions={
                            <Button
                                size="sm"
                                disabled={!hasChanges || save.isPending}
                                onClick={() => onSave(group.appCode)}
                            >
                                {save.isPending ? HOOKS_TEXT.saving : HOOKS_TEXT.save}
                            </Button>
                        }
                    >
                        <div className="space-y-5">
                            {group.items.map(({ ref, descriptor }) => (
                                <div key={ref.code} className="space-y-2 rounded-md border p-3">
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <RoleBadge role={ref.role} />
                                        <span className="text-muted-foreground">
                                            {HOOKS_TEXT.settingNote}: {ref.note}
                                        </span>
                                    </div>
                                    <AppSettingField
                                        descriptor={descriptor}
                                        draft={groupDraft[descriptor.code]}
                                        onChange={value =>
                                            setDraft(current => ({
                                                ...current,
                                                [group.appCode]: {
                                                    ...(current[group.appCode] ?? {}),
                                                    [descriptor.code]: value,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                );
            })}

            {form.missing.length > 0 && (
                <HookNotice
                    tone="info"
                    title={HOOKS_TEXT.settingsMissingInSchema}
                    message={
                        <ul className="list-disc space-y-0.5 pl-5">
                            {form.missing.map(ref => (
                                <li key={`${ref.app}:${ref.code}`}>
                                    {ref.name} (<code className="font-mono">{ref.code}</code>)
                                </li>
                            ))}
                        </ul>
                    }
                />
            )}
        </div>
    );
};
