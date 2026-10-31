'use client';

import { useQuery } from '@tanstack/react-query';
import { PortalRegionsHelper } from '../api/portalRegions-helper';
import type {
    AdminPortalGarantRegionListParams,
    PortalRegion,
} from '../../model';

const helper = new PortalRegionsHelper();

export const usePortalRegions = (params: AdminPortalGarantRegionListParams) =>
    useQuery<PortalRegion[], Error>({
        queryKey: ['portalRegions', params],
        queryFn: () => helper.getPortalRegions(params),
    });
