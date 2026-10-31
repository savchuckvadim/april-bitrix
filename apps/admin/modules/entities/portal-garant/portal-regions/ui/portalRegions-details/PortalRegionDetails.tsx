'use client';

import { useParams } from 'next/navigation';
import { usePortalRegionDetails } from '../../lib/hooks';
import { PortalRegionsCard } from '../portalRegions-card/PortalRegionsCard';
import { PortalRegionsEdit } from '../portalRegions-form/PortalRegionsEdit';
import { RegionCard, useRegion } from '@/modules/entities/garant/regions';

export function PortalRegionDetails() {
    const params = useParams();
    const portalId = Number(params.portalId);
    const regionId = Number(params.id);

    const { region, isLoading } = usePortalRegionDetails(portalId, regionId);
    const { data: originalRegion, isLoading: isLoadingOriginalRegion, isError: isErrorOriginalRegion, error: errorOriginalRegion } = useRegion(regionId);
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!region) {
        return <div>Region not found</div>;
    }

    return (
        < >
            <PortalRegionsCard item={region} />

            <h2>Своя цена портала</h2>
            <PortalRegionsEdit />

            <h2>Регион в общем справочнике</h2>
            {isLoadingOriginalRegion && <div>Loading...</div>}
            {isErrorOriginalRegion && <div>Error: {errorOriginalRegion.message}</div>}

            {originalRegion && <RegionCard item={originalRegion} />}
        </>
    );
}
