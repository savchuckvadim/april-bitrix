'use client';

import * as React from 'react';

import { usePortalRegionsList } from '../../lib/hooks/';
import { usePortalRegionsDraft } from '../../lib/hooks/use-portalRegions-bulk';
import { PortalRegionsFilter } from './components/PortalRegionsFilter';
import { PortalRegionsBulkBar } from '../portalRegions-bulk/PortalRegionsBulkBar';
import { PortalRegionsBulkTable } from '../portalRegions-bulk/PortalRegionsBulkTable';

/**
 * Регионы портала: отмечаем галочками, какие доступны, и при
 * необходимости задаём свой рабс. Все правки уходят одним сохранением.
 */
export function PortalRegionsList({ portalId }: { portalId: number }) {
    const {
        regions,
        isLoading,
        search,
        setSearch,
        isOwnRegionsFilter,
        setIsOwnRegionsFilter,
        isNotOwnRegionsFilter,
        setIsNotOwnRegionsFilter,
    } = usePortalRegionsList(portalId);

    const draft = usePortalRegionsDraft(portalId, regions);

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold">Регионы портала</h1>
                <p className="text-muted-foreground text-sm">
                    Отметьте регионы, с которыми работает этот портал. Общий
                    справочник регионов и их рабсы — в разделе «Гарант».
                </p>
            </div>

            <PortalRegionsBulkBar
                changesCount={draft.changesCount}
                isSaving={draft.isSaving}
                result={draft.result}
                error={draft.error}
                onSave={() => void draft.save()}
                onReset={draft.reset}
            />

            <PortalRegionsFilter
                search={search}
                onSearchChange={setSearch}
                isOwnRegionsFilter={isOwnRegionsFilter}
                onOwnRegionsFilterChange={setIsOwnRegionsFilter}
                isNotOwnRegionsFilter={isNotOwnRegionsFilter}
                onNotOwnRegionsFilterChange={setIsNotOwnRegionsFilter}
            />

            <PortalRegionsBulkTable
                regions={regions ?? []}
                isLoading={isLoading}
                effective={draft.effective}
                changes={draft.changes}
                onToggle={draft.toggle}
                onOwnAbsChange={draft.setOwnAbs}
            />
        </div>
    );
}
