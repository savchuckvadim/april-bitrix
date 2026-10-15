'use client';

import Link from 'next/link';
import { APP_SETTINGS_TEXT } from '../../../consts/app-settings.const';
import {
    groupRequirementsByEntity,
    resolveSettingsLink,
} from '../../../lib/settings-view';
import type {
    PortalAppSettingEntity,
    PortalAppSettingHookLink,
    PortalAppSettingPbxField,
    PortalAppSettingStage,
} from '../../../model';

const ENTITY_LABEL: Record<PortalAppSettingEntity, string> = {
    lead: 'Лид',
    deal: 'Сделка',
    company: 'Компания',
    contact: 'Контакт',
    task: 'Задача',
};

const LINK_CLASS = 'underline underline-offset-2 hover:text-foreground';

interface SettingUsageProps {
    portalId: number;
    hooks?: PortalAppSettingHookLink[];
}

/**
 * Как настройку используют хуки — у поля настройки: хук (ссылка на его
 * страницу), рубильник это или параметр, и заметка «к чему приведёт».
 */
export const AppSettingUsage = ({ portalId, hooks = [] }: SettingUsageProps) => {
    if (hooks.length === 0) return null;
    return (
        <div className="space-y-0.5 rounded bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">
                {APP_SETTINGS_TEXT.usageLabel}
            </div>
            {hooks.map(hook => (
                <div key={hook.code}>
                    <Link
                        href={resolveSettingsLink(hook.href, portalId)}
                        className={LINK_CLASS}
                        title={hook.code}
                    >
                        {hook.title}
                    </Link>
                    {hook.role === 'gate' && (
                        <span className="ml-1 rounded bg-warning/15 px-1 text-[10px] text-warning">
                            {APP_SETTINGS_TEXT.gateBadge}
                        </span>
                    )}
                    {hook.note && <span>: {hook.note}</span>}
                </div>
            ))}
        </div>
    );
};

interface GroupRelationsProps {
    portalId: number;
    hooks?: PortalAppSettingHookLink[];
    pbxFields?: PortalAppSettingPbxField[];
    stages?: PortalAppSettingStage[];
}

/**
 * Связи категории: хуки, которые её читают, и «Что установить на портале»
 * — поля и стадии этих хуков по сущностям, обязательные отмечены «*»,
 * каждая строка ведёт в раздел PBX портала, где это ставится.
 */
export const AppSettingGroupRelations = ({
    portalId,
    hooks = [],
    pbxFields = [],
    stages = [],
}: GroupRelationsProps) => {
    const requirements = groupRequirementsByEntity(pbxFields, stages);
    if (hooks.length === 0 && requirements.length === 0) return null;

    return (
        <div className="space-y-2 text-xs text-muted-foreground">
            {hooks.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span>{APP_SETTINGS_TEXT.hooksLabel}</span>
                    {hooks.map(hook => (
                        <Link
                            key={hook.code}
                            href={resolveSettingsLink(hook.href, portalId)}
                            className="rounded border px-2 py-0.5 hover:bg-accent hover:text-foreground"
                            title={hook.code}
                        >
                            {hook.title}
                            {hook.role === 'gate' && (
                                <span className="ml-1 text-warning">
                                    · {APP_SETTINGS_TEXT.gateBadge}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
            {requirements.length > 0 && (
                <details className="rounded-md border px-3 py-2">
                    <summary className="cursor-pointer font-medium text-foreground">
                        {APP_SETTINGS_TEXT.requirementsTitle}
                    </summary>
                    <p className="mt-1">{APP_SETTINGS_TEXT.requirementsHint}</p>
                    <div className="mt-2 space-y-2">
                        {requirements.map(item => (
                            <div key={item.entity}>
                                <div className="font-medium text-foreground">
                                    {ENTITY_LABEL[item.entity]}
                                </div>
                                <ul className="mt-0.5 space-y-0.5 pl-3">
                                    {item.fields.map(field => (
                                        <li key={`f:${field.code}`}>
                                            <Link
                                                href={resolveSettingsLink(
                                                    field.href,
                                                    portalId,
                                                )}
                                                className={LINK_CLASS}
                                            >
                                                {field.name}
                                            </Link>{' '}
                                            <code className="font-mono text-[10px]">
                                                {field.code}
                                            </code>
                                            {field.required && (
                                                <span className="text-destructive"> *</span>
                                            )}
                                        </li>
                                    ))}
                                    {item.stages.map(stage => (
                                        <li key={`s:${stage.code}`}>
                                            {APP_SETTINGS_TEXT.stagePrefix}{' '}
                                            <Link
                                                href={resolveSettingsLink(
                                                    stage.href,
                                                    portalId,
                                                )}
                                                className={LINK_CLASS}
                                            >
                                                {stage.title}
                                            </Link>{' '}
                                            <code className="font-mono text-[10px]">
                                                {stage.code}
                                            </code>
                                            {stage.required && (
                                                <span className="text-destructive"> *</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
};
