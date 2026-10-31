'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { UpdatePortalRegionDto } from '../../model';
import { toSourceOptions, withoutRegion } from '../region-view.util';
import { useGetUpdateInitialDataPortalRegion } from './use-get-update-initial-data-portalRegion';
import { usePortalRegions } from './use-portalRegions';
import { useUpdatePortalRegion } from './use-update-portalRegion';

/** Страница правки своей цены одного региона портала */
export const usePortalRegionEdit = () => {
    const router = useRouter();
    const params = useParams();
    const portalId = Number(params.portalId);
    const regionId = Number(params.id);

    const { data: initialData } = useGetUpdateInitialDataPortalRegion(
        portalId,
        regionId,
    );
    const { data: regions } = usePortalRegions({ portalId });
    const update = useUpdatePortalRegion();

    const sourceOptions = useMemo(
        () => withoutRegion(toSourceOptions(regions ?? []), regionId),
        [regions, regionId],
    );

    return {
        initialData,
        sourceOptions,
        submit: (dto: UpdatePortalRegionDto) =>
            update.mutate({ portalId, regionId, dto }),
        cancel: () => router.back(),
        isSaving: update.isPending,
        isSaved: update.isSuccess,
        error: update.error,
    };
};
