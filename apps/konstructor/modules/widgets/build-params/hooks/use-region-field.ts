'use client';

import { useState } from 'react';
import { useAppSelector } from '@/modules/app';
import {
    hasPortalRegions,
    selectableRegions,
    selectCatalog,
} from '@/modules/entities/catalog';

/**
 * Выбор региона: по умолчанию — регионы портала, переключатель открывает весь
 * справочник. У портала без привязок переключать нечего: список и так полный.
 */
export const useRegionField = (value: string | null) => {
    const all = useAppSelector(selectCatalog).regions.items;
    const [showAll, setShowAll] = useState(false);

    return {
        regions: selectableRegions(all, { showAll, currentCode: value }),
        canToggle: hasPortalRegions(all),
        showAll,
        toggleShowAll: () => setShowAll(prev => !prev),
    };
};
