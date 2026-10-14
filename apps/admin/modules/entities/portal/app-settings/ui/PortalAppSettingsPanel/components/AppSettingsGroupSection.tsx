'use client';

import Link from 'next/link';
import type { AppSettingsGroupView } from '../../../lib/settings-view';
import { resolveSettingsLink } from '../../../lib/settings-view';
import type { PortalAppSettingValue } from '../../../model';
import { AppSettingField } from './AppSettingField';

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
 * ссылки на связанные разделы админки и сами поля. Без поиска свёрнута —
 * в сотне ключей ориентируются по заголовкам.
 */
export const AppSettingsGroupSection = ({
    portalId,
    view,
    searching,
    draft,
    onChange,
}: AppSettingsGroupSectionProps) => (
    <details
        // Ключ со «searching»: раскрытость при поиске задаём сами, а при
        // выходе из поиска секция возвращается в свёрнутое состояние.
        key={`${view.group.code}-${searching ? 'search' : 'browse'}`}
        open={searching || undefined}
        className="group rounded-md border"
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
                    {view.group.description && <p>{view.group.description}</p>}
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
            {view.settings.map(descriptor => (
                <AppSettingField
                    key={descriptor.code}
                    descriptor={descriptor}
                    draft={draft[descriptor.code]}
                    onChange={value => onChange(descriptor.code, value)}
                />
            ))}
        </div>
    </details>
);
