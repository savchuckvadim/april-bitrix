'use client';

import * as React from 'react';

import { UpdatePortalRegionDto } from '../../model';
import { PortalRegionsForm } from './PortalRegionsForm';
import { useParams, useRouter } from 'next/navigation';
import { useGetUpdateInitialDataPortalRegion, usePortalRegions, useUpdatePortalRegion } from '../../lib/hooks';



export function PortalRegionsEdit() {
    const router = useRouter();
    const params = useParams();
    const portalId = Number(params.portalId);
    const regionId = Number(params.id);


    const { data: initialdata } = useGetUpdateInitialDataPortalRegion(portalId, regionId);
    const {
        mutate: updatePortalRegion,
        isPending: isUpdatingPortalRegion,
        isError: isErrorUpdatingPortalRegion,
        isSuccess: isSuccessUpdatingPortalRegion,
        error: errorUpdatingPortalRegion,

    } = useUpdatePortalRegion();

    const handleSubmit = (data: UpdatePortalRegionDto) => {
        updatePortalRegion({ portalId, regionId, dto: data });
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div>
            {isUpdatingPortalRegion && <div>Loading...</div>}
            {isErrorUpdatingPortalRegion && <div>Error: {errorUpdatingPortalRegion.message}</div>}
            {isSuccessUpdatingPortalRegion && <div>Success: {isSuccessUpdatingPortalRegion}</div>}

            <PortalRegionsForm
                initialData={initialdata}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isUpdatingPortalRegion}
            />

        </div>
    );
}
