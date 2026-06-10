'use client';

import * as React from 'react';
import { InfoblockListItem } from '../../model';
import { InfoblockSearchFilterState } from '../../ui/infoblock-list/components';

/**
 * Хук для управления поиском и фильтрацией инфоблоков
 * Инкапсулирует логику фильтрации данных по различным критериям
 */
export function useInfoblockSearch(infoblocks: InfoblockListItem[] | undefined) {
    const [filters, setFilters] = React.useState<InfoblockSearchFilterState>({
        search: '',
        selectedGroups: [],
        selectedFlags: {},
    });

    // Фильтрация данных
    const filteredInfoblocks = React.useMemo(() => {
        if (!infoblocks) return [];

        return infoblocks.filter((infoblock) => {
            // Поиск по тексту
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesName = infoblock.name?.toLowerCase().includes(searchLower);
                const matchesCode = infoblock.code?.toLowerCase().includes(searchLower);
                if (!matchesName && !matchesCode) {
                    return false;
                }
            }

            // Фильтр по группам
            if (filters.selectedGroups.length > 0) {
                const groupId = infoblock.group_id?.toString() || '';
                if (!filters.selectedGroups.includes(groupId)) {
                    return false;
                }
            }

            // Фильтр по флагам
            if (filters.selectedFlags.isPackage !== undefined) {
                if (infoblock.isPackage !== filters.selectedFlags.isPackage) {
                    return false;
                }
            }
            if (filters.selectedFlags.isProduct !== undefined) {
                if (infoblock.isProduct !== filters.selectedFlags.isProduct) {
                    return false;
                }
            }
            if (filters.selectedFlags.isFree !== undefined) {
                if (infoblock.isFree !== filters.selectedFlags.isFree) {
                    return false;
                }
            }
            if (filters.selectedFlags.isLa !== undefined) {
                if (infoblock.isLa !== filters.selectedFlags.isLa) {
                    return false;
                }
            }
            if (filters.selectedFlags.isSet !== undefined) {
                if (infoblock.isSet !== filters.selectedFlags.isSet) {
                    return false;
                }
            }

            return true;
        });
    }, [infoblocks, filters]);

    return {
        filters,
        setFilters,
        filteredInfoblocks,
    };
}
