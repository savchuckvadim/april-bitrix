'use client';

import { useMemo, useState } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Input } from '@workspace/ui/components/input';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { HOOKS_TEXT } from '../../consts/hooks.const';
import { useHookCatalog, usePortalHooksReadiness } from '../../lib/hooks';
import {
    filterHookItems,
    groupHooksByFamily,
    indexReadinessByCode,
    normalizeHookQuery,
} from '../../lib/hooks-view';
import { HookNotice } from '../components/HookNotice';
import { HookPortalSelect } from '../components/HookPortalSelect';
import { useHooksPortalSelection } from '../hooks/use-hooks-portal-selection';
import { HookCatalogRow } from './components/HookCatalogRow';

interface HooksCatalogPanelProps {
    /** Карточка портала: портал задан маршрутом, селектора нет. */
    fixedPortalId?: number;
}

/**
 * Каталог хуков по семействам. С выбранным порталом каждая строка получает
 * готовность (установлены ли поля и стадии, рубильник) и список того, чего
 * не хватает. Поиск — по названию, описанию и коду.
 */
export const HooksCatalogPanel = ({ fixedPortalId }: HooksCatalogPanelProps) => {
    const selection = useHooksPortalSelection(fixedPortalId);
    const catalog = useHookCatalog();
    const readiness = usePortalHooksReadiness(selection.portalId);
    const [query, setQuery] = useState('');

    const groups = useMemo(
        () => groupHooksByFamily(filterHookItems(catalog.data ?? [], query)),
        [catalog.data, query],
    );
    const readinessByCode = useMemo(
        () => indexReadinessByCode(readiness.data),
        [readiness.data],
    );
    const searching = normalizeHookQuery(query).length > 0;

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold">{HOOKS_TEXT.pageTitle}</h1>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                    {HOOKS_TEXT.pageDescription}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
                {!selection.isFixed && (
                    <HookPortalSelect
                        value={selection.portalId}
                        onChange={selection.setPortalId}
                    />
                )}
                <Input
                    type="search"
                    className="w-96 max-w-full"
                    value={query}
                    placeholder={HOOKS_TEXT.searchPlaceholder}
                    onChange={event => setQuery(event.target.value)}
                />
            </div>

            {selection.portalId && readiness.isLoading && (
                <p className="text-sm text-muted-foreground">
                    {HOOKS_TEXT.readinessLoading}
                </p>
            )}
            {readiness.isError && (
                <HookNotice
                    tone="error"
                    title={HOOKS_TEXT.readinessLoadError}
                    message={getApiErrorMessage(readiness.error)}
                />
            )}

            {catalog.isLoading && (
                <p className="text-sm text-muted-foreground">
                    {HOOKS_TEXT.loading}
                </p>
            )}
            {catalog.isError && (
                <HookNotice
                    tone="error"
                    title={HOOKS_TEXT.catalogLoadError}
                    message={getApiErrorMessage(catalog.error)}
                />
            )}
            {catalog.data && groups.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    {searching
                        ? HOOKS_TEXT.nothingFound
                        : HOOKS_TEXT.catalogEmpty}
                </p>
            )}

            {groups.map(group => (
                <SectionCard
                    key={group.family}
                    title={group.title}
                    actions={
                        <span className="text-xs text-muted-foreground">
                            {group.items.length}
                        </span>
                    }
                >
                    <div className="divide-y rounded-md border">
                        {group.items.map(item => (
                            <HookCatalogRow
                                key={item.code}
                                item={item}
                                readiness={readinessByCode.get(item.code)}
                                portalId={selection.portalId}
                                fixed={selection.isFixed}
                            />
                        ))}
                    </div>
                </SectionCard>
            ))}
        </div>
    );
};
