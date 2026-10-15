'use client';

import Link from 'next/link';
import { HOOKS_TEXT } from '../../../consts/hooks.const';
import { buildHookHref, formatMissingRequired } from '../../../lib/hooks-view';
import type { HookCatalogItem, PortalHookReadiness } from '../../../model';
import {
    HookCronBadge,
    HookKindBadge,
    HookReadinessBadges,
} from '../../components/HookBadges';

interface HookCatalogRowProps {
    item: HookCatalogItem;
    /** Готовность на выбранном портале; нет портала — нет бэйджей. */
    readiness?: PortalHookReadiness;
    portalId: number | undefined;
    fixed: boolean;
}

/** Строка каталога: название, код, запуск, расписание, готовность, «не хватает». */
export const HookCatalogRow = ({
    item,
    readiness,
    portalId,
    fixed,
}: HookCatalogRowProps) => {
    const missing = readiness
        ? formatMissingRequired(readiness.missingRequired)
        : '';

    return (
        <Link
            href={buildHookHref(item.code, portalId, fixed)}
            className="block space-y-1 px-3 py-3 transition-colors hover:bg-accent/50"
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{item.title}</span>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    {item.code}
                </code>
                <HookKindBadge kind={item.kind} size="sm" />
                {item.cron && <HookCronBadge cron={item.cron} size="sm" />}
                {readiness && (
                    <HookReadinessBadges readiness={readiness} size="sm" />
                )}
            </div>
            <p className="text-sm text-muted-foreground">{item.summary}</p>
            {missing && (
                <p className="text-xs text-warning">
                    {HOOKS_TEXT.missingPrefix} {missing}
                </p>
            )}
            <p className="text-[11px] text-muted-foreground">
                {HOOKS_TEXT.requiredFields}: {item.requiredFieldsCount} ·{' '}
                {HOOKS_TEXT.requiredStages}: {item.requiredStagesCount} ·{' '}
                {HOOKS_TEXT.settings}: {item.settingsCount}
            </p>
        </Link>
    );
};
