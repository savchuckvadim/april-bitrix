import { useState } from 'react';
import { usePortalRegions } from './use-portalRegions';
import {
    useFilteredRegions,
    type RegionOwnershipFilter,
} from './use-filteredRegions';

/** Список регионов портала: весь справочник и его отфильтрованная часть */
export const usePortalRegionsList = (portalId: number) => {
    const { data: allRegions, isLoading } = usePortalRegions({ portalId });

    const [search, setSearch] = useState('');
    const [ownershipFilter, setOwnershipFilter] =
        useState<RegionOwnershipFilter>('all');

    const regions = useFilteredRegions({
        regions: allRegions,
        search,
        ownershipFilter,
    });

    return {
        allRegions,
        regions,
        isLoading,
        search,
        setSearch,
        isOwnRegionsFilter: ownershipFilter === 'own',
        setIsOwnRegionsFilter: (value: boolean) =>
            setOwnershipFilter(value ? 'own' : 'all'),
        isNotOwnRegionsFilter: ownershipFilter === 'notOwn',
        setIsNotOwnRegionsFilter: (value: boolean) =>
            setOwnershipFilter(value ? 'notOwn' : 'all'),
    };
};
