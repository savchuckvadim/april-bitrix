'use client';

import * as React from 'react';
import { PriceEntity } from '@/modules/entities/garant/prof-price/model';
import { useComplects } from '@/modules/entities/garant/complect';
import { useSupplies } from '@/modules/entities/garant/supplies';

/**
 * Состояние фильтров для prof prices
 */
export interface ProfPriceFilterState {
    selectedRegions: string[];
    selectedSupplyTypes: string[];
    selectedComplects: string[];
    selectedSupplies: string[];
}

/**
 * Опции для фильтров
 */
export interface ProfPriceFilterOptions {
    regionOptions: Array<{ id: string; label: string }>;
    supplyTypeOptions: Array<{ id: string; label: string }>;
    complectOptions: Array<{ id: string; label: string }>;
    supplyOptions: Array<{ id: string; label: string }>;
}

/**
 * Хук для управления фильтрацией prof prices
 * Инкапсулирует логику фильтрации данных по различным критериям
 */
export function useProfPriceFilter(profPrices: PriceEntity[] | undefined) {
    const { data: complects } = useComplects();
    const { data: supplies } = useSupplies();

    // Состояние фильтров
    const [filters, setFilters] = React.useState<ProfPriceFilterState>({
        selectedRegions: [],
        selectedSupplyTypes: [],
        selectedComplects: [],
        selectedSupplies: [],
    });

    // Опции для фильтров
    const regionOptions: Array<{ id: string; label: string }> = [
        { id: '0', label: 'Москва' },
        { id: '1', label: 'Регионы' },
    ];

    const supplyTypeOptions: Array<{ id: string; label: string }> = [
        { id: 'internet', label: 'Интернет' },
        { id: 'proxima', label: 'Проксима' },
    ];

    const complectOptions = React.useMemo(() => {
        return (complects || []).map((c) => ({
            id: c.id,
            label: c.name || c.shortName || `ID: ${c.id}`,
        }));
    }, [complects]);

    const supplyOptions = React.useMemo(() => {
        return (supplies || []).map((s) => ({
            id: s.id.toString(),
            label: s.fullName || s.name || s.shortName || `ID: ${s.id}`,
        }));
    }, [supplies]);

    // Фильтрация данных
    const filteredProfPrices = React.useMemo(() => {
        if (!profPrices) return [];

        return profPrices.filter((price) => {
            // Фильтр по регионам
            if (filters.selectedRegions.length > 0) {
                const regionType = price.region_type?.toString() || '';
                if (!filters.selectedRegions.includes(regionType)) {
                    return false;
                }
            }

            // Фильтр по типам поставки
            if (filters.selectedSupplyTypes.length > 0) {
                const supplyType = price.supply_type?.toString() || '';
                if (!filters.selectedSupplyTypes.includes(supplyType)) {
                    return false;
                }
            }

            // Фильтр по комплектам
            if (filters.selectedComplects.length > 0) {
                const complectId = price.complect_id?.toString() || '';
                if (!filters.selectedComplects.includes(complectId)) {
                    return false;
                }
            }

            // Фильтр по поставкам
            if (filters.selectedSupplies.length > 0) {
                const supplyId = price.supply_id?.toString() || '';
                if (!filters.selectedSupplies.includes(supplyId)) {
                    return false;
                }
            }

            return true;
        });
    }, [profPrices, filters]);

    // Функции для обновления фильтров
    const updateFilters = React.useCallback((updates: Partial<ProfPriceFilterState>) => {
        setFilters((prev) => ({ ...prev, ...updates }));
    }, []);

    const setSelectedRegions = React.useCallback((regions: string[]) => {
        setFilters((prev) => ({ ...prev, selectedRegions: regions }));
    }, []);

    const setSelectedSupplyTypes = React.useCallback((types: string[]) => {
        setFilters((prev) => ({ ...prev, selectedSupplyTypes: types }));
    }, []);

    const setSelectedComplects = React.useCallback((complects: string[]) => {
        setFilters((prev) => ({ ...prev, selectedComplects: complects }));
    }, []);

    const setSelectedSupplies = React.useCallback((supplies: string[]) => {
        setFilters((prev) => ({ ...prev, selectedSupplies: supplies }));
    }, []);

    return {
        filters,
        setFilters,
        updateFilters,
        setSelectedRegions,
        setSelectedSupplyTypes,
        setSelectedComplects,
        setSelectedSupplies,
        filteredProfPrices,
        filterOptions: {
            regionOptions,
            supplyTypeOptions,
            complectOptions,
            supplyOptions,
        },
    };
}
