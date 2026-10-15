'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HOOKS_TEXT } from '../../../consts/hooks.const';
import { buildHooksCatalogHref } from '../../../lib/hooks-view';
import type { HookCatalogEntry, PortalHookReadiness } from '../../../model';
import {
    HookCronBadge,
    HookKindBadge,
    HookReadinessBadges,
} from '../../components/HookBadges';
import { HookNotice } from '../../components/HookNotice';
import { HookPortalSelect } from '../../components/HookPortalSelect';
import type { HooksPortalSelection } from '../../hooks/use-hooks-portal-selection';

interface HookHeaderProps {
    entry: HookCatalogEntry;
    selection: HooksPortalSelection;
    readiness: PortalHookReadiness | undefined;
    readinessLoading: boolean;
    readinessError: unknown;
}

/**
 * Шапка карточки хука: название, код, запуск, расписание, семейство и
 * готовность на выбранном портале — со списком того, чего не хватает.
 */
export const HookHeader = ({
    entry,
    selection,
    readiness,
    readinessLoading,
    readinessError,
}: HookHeaderProps) => (
    <div className="space-y-3">
        <Link
            href={buildHooksCatalogHref(selection.portalId, selection.isFixed)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
            <ArrowLeft className="size-4" />
            {HOOKS_TEXT.backToCatalog}
        </Link>

        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{entry.title}</h1>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {entry.code}
                </code>
                <HookKindBadge kind={entry.kind} />
                {entry.cron && <HookCronBadge cron={entry.cron} />}
            </div>
            <p className="text-xs text-muted-foreground">
                {HOOKS_TEXT.family}: {entry.familyTitle}
                {entry.cron && (
                    <>
                        {' · '}
                        {HOOKS_TEXT.cron}:{' '}
                        <code className="font-mono">{entry.cron.name}</code>
                    </>
                )}
            </p>
            <p className="max-w-4xl text-sm">{entry.summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {!selection.isFixed && (
                <HookPortalSelect
                    value={selection.portalId}
                    onChange={selection.setPortalId}
                />
            )}
            {readiness && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        {HOOKS_TEXT.readinessOnPortal}:
                    </span>
                    <HookReadinessBadges readiness={readiness} />
                </div>
            )}
            {selection.portalId && readinessLoading && (
                <span className="text-xs text-muted-foreground">
                    {HOOKS_TEXT.readinessLoading}
                </span>
            )}
        </div>

        {!selection.portalId && (
            <p className="text-xs text-muted-foreground">
                {HOOKS_TEXT.selectPortalHint}
            </p>
        )}
        {readinessError ? (
            <HookNotice
                tone="error"
                title={HOOKS_TEXT.readinessLoadError}
                message={getApiErrorMessage(readinessError)}
            />
        ) : null}
        {readiness && readiness.missingRequired.length > 0 && (
            <HookNotice
                tone="warning"
                title={HOOKS_TEXT.missingTitle}
                message={
                    <ul className="list-disc space-y-0.5 pl-5">
                        {readiness.missingRequired.map(item => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                }
            />
        )}
    </div>
);
