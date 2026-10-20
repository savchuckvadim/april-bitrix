'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLocationHash } from '@/modules/shared/lib';
import { MarkdownView } from '@/modules/shared/ui/markdown';
import { APP_SETTINGS_TEXT } from '../../../consts/app-settings.const';
import type { AppSettingsGroupView } from '../../../lib/settings-view';
import {
    groupAnchorId,
    isGroupAnchored,
    resolveSettingsLink,
} from '../../../lib/settings-view';
import type { PortalAppSettingValue } from '../../../model';
import { AppSettingField } from './AppSettingField';
import { AppSettingGroupRelations } from './AppSettingRelations';

interface AppSettingsGroupSectionProps {
    portalId: number;
    view: AppSettingsGroupView;
    /** Идёт поиск — секция раскрыта и показывает только найденное. */
    searching: boolean;
    draft: Record<string, PortalAppSettingValue>;
    onChange: (code: string, value: PortalAppSettingValue) => void;
}

/**
 * Секция категории: заголовок со счётчиком «настроено», пояснение,
 * ссылки на связанные разделы админки, теория «Как это работает»
 * (свёрнута), хуки и PBX-поля категории и сами поля. Без поиска свёрнута —
 * в сотне ключей ориентируются по заголовкам; якорь адреса на категорию
 * (`#group-<код>`) или на её ключ (`#setting-<код>`) раскрывает секцию и
 * прокручивает к ней — по таким ссылкам ведут путеводитель и хуки.
 */
export const AppSettingsGroupSection = ({
    portalId,
    view,
    searching,
    draft,
    onChange,
}: AppSettingsGroupSectionProps) => {
    const [hash] = useLocationHash();
    const anchored = isGroupAnchored(
        hash,
        view.group.code,
        view.settings.map(setting => setting.code),
    );
    const ref = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
        if (!anchored || !ref.current) return;
        const anchor = hash.replace(/^#/, '');
        const target = document.getElementById(anchor) ?? ref.current;
        target.scrollIntoView({ block: 'start' });
    }, [anchored, hash]);

    return (
        <details
            // Ключ со «searching»: раскрытость при поиске задаём сами, а при
            // выходе из поиска секция возвращается в свёрнутое состояние.
            key={`${view.group.code}-${searching ? 'search' : 'browse'}`}
            ref={ref}
            id={groupAnchorId(view.group.code)}
            open={searching || anchored || undefined}
            className="group scroll-mt-4 rounded-md border"
        >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2">
                <span className="text-sm font-medium">{view.group.title}</span>
                <span className="text-xs text-muted-foreground">
                    {searching
                        ? `найдено ${view.settings.length}`
                        : `настроено ${view.customized} из ${view.total}`}
                </span>
            </summary>
            <div className="space-y-4 border-t px-3 py-3">
                {(view.group.description || view.group.links.length > 0) && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                        {view.group.description && (
                            <p>{view.group.description}</p>
                        )}
                        {view.group.links.length > 0 && (
                            <p className="flex flex-wrap gap-x-3 gap-y-1">
                                {view.group.links.map(item => (
                                    <Link
                                        key={item.href}
                                        href={resolveSettingsLink(
                                            item.href,
                                            portalId,
                                        )}
                                        className="underline underline-offset-2 hover:text-foreground"
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </p>
                        )}
                    </div>
                )}
                {view.group.theory && (
                    <details className="rounded-md bg-muted/40 px-3 py-2">
                        <summary className="cursor-pointer text-xs font-medium text-foreground">
                            {APP_SETTINGS_TEXT.theoryToggle}
                        </summary>
                        <MarkdownView
                            text={view.group.theory}
                            className="mt-2"
                        />
                    </details>
                )}
                <AppSettingGroupRelations
                    portalId={portalId}
                    hooks={view.group.hooks}
                    pbxFields={view.group.pbxFields}
                    stages={view.group.stages}
                />
                {view.settings.map(descriptor => (
                    <AppSettingField
                        key={descriptor.code}
                        descriptor={descriptor}
                        draft={draft[descriptor.code]}
                        onChange={value => onChange(descriptor.code, value)}
                        portalId={portalId}
                    />
                ))}
            </div>
        </details>
    );
};
