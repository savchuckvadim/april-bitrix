import React from 'react';
import { GetPortalRegionResponseDto } from '@workspace/nest-api';

export type RegionOwnershipFilter = 'all' | 'own' | 'notOwn';

interface FilterRegionsParams {
    regions: GetPortalRegionResponseDto[] | undefined;
    search: string;
    ownershipFilter: RegionOwnershipFilter;
}

/**
 * Функция для фильтрации регионов по поисковому запросу и принадлежности
 *
 * @param regions - Массив регионов для фильтрации
 * @param search - Поисковый запрос (поиск по полю title)
 * @param ownershipFilter - Фильтр принадлежности: 'all' | 'own' | 'notOwn'
 * @returns Отфильтрованный массив регионов
 */
const filterRegions = ({
    regions,
    search,
    ownershipFilter,
}: FilterRegionsParams): GetPortalRegionResponseDto[] => {
    if (!regions) {
        return [];
    }

    let filtered = regions;

    // Фильтр по принадлежности (свои/не свои)
    if (ownershipFilter === 'own') {
        filtered = filtered.filter((region) => region.isChecked === true);
    } else if (ownershipFilter === 'notOwn') {
        filtered = filtered.filter((region) => region.isChecked === false);
    }
    // Если ownershipFilter === 'all', фильтр не применяется

    // Фильтр по поисковому запросу
    if (search.trim()) {
        const searchLower = search.toLowerCase().trim();
        filtered = filtered.filter((region) =>
            region.title.toLowerCase().includes(searchLower)
        );
    }

    return filtered;
};

interface UseFilteredRegionsParams {
    regions: GetPortalRegionResponseDto[] | undefined;
    search: string;
    ownershipFilter: RegionOwnershipFilter;
}

/**
 * Хук для фильтрации регионов по поисковому запросу и принадлежности
 *
 * @param regions - Массив регионов для фильтрации
 * @param search - Поисковый запрос (поиск по полю title)
 * @param ownershipFilter - Фильтр принадлежности: 'all' | 'own' | 'notOwn'
 * @returns Отфильтрованный массив регионов
 */
export const useFilteredRegions = ({
    regions,
    search,
    ownershipFilter,
}: UseFilteredRegionsParams): GetPortalRegionResponseDto[] => {
    return React.useMemo(
        () => filterRegions({ regions, search, ownershipFilter }),
        [regions, search, ownershipFilter]
    );
};

// Экспортируем функцию для использования вне хуков
export { filterRegions };
