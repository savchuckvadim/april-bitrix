'use client';

import * as React from 'react';

import { PortalRegionsTable } from '../../ui/portalRegions-table';
import { Button } from '@workspace/ui/components/button';
import { GetPortalRegionResponseDto } from '../../model';
import { usePortalRegionsList } from '../../lib/hooks/';
import { PortalRegionsFilter } from './components/PortalRegionsFilter';

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

        handleRowClick,
        handleEdit,
        // handleDelete,
        // confirmDelete,
        handleCheckboxChange,
    } = usePortalRegionsList(portalId);

    return (
        <>

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Portal Regions</h1>

            </div>

            <PortalRegionsFilter
                search={search}
                onSearchChange={setSearch}
                isOwnRegionsFilter={isOwnRegionsFilter}
                onOwnRegionsFilterChange={setIsOwnRegionsFilter}
                isNotOwnRegionsFilter={isNotOwnRegionsFilter}
                onNotOwnRegionsFilterChange={setIsNotOwnRegionsFilter}
            />

            <PortalRegionsTable
                onCheckboxChange={handleCheckboxChange}
                data={regions}
                isLoading={isLoading}
                onRowClick={(region: GetPortalRegionResponseDto) => handleRowClick(Number(region.id))}
                onEdit={handleEdit}

            />

        </>
    );
}
