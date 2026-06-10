'use client';

import * as React from 'react';
import { useInfoblocks } from '@/modules/entities/garant/infoblock';
import { useInfoGroups } from '@/modules/entities/garant/info-groups';
import { useComplect } from '@/modules/entities/garant/complect';
import { useSetComplectInfoblocks } from './use-complect-infoblocks';
import { useInfoblockSelection } from './use-infoblock-selection';
import { groupInfoblocksByGroup } from '../utils/grouping.utils';
import { calculateTotalWeight } from '../utils/weight.utils';
import { checkWeightMatch } from '../utils/weight.utils';
import { createPackageColorMap } from '../utils/package-colors.utils';
import { getActivePackagesForInfoblock } from '../utils/package-colors.utils';
import { InfoblockListItem } from '@/modules/entities/garant/infoblock';

export const useComplectInfoblocksForm = (complectId: string) => {
    const { data: allInfoblocks = [], isLoading: isLoadingInfoblocks } = useInfoblocks();
    debugger
    const { data: infoGroups = [], isLoading: isLoadingGroups } = useInfoGroups();
    const { data: complect, isLoading: isLoadingComplect } = useComplect(complectId);
    const setInfoblocksMutation = useSetComplectInfoblocks(complectId);

    // Инициализация выбранных инфоблоков из данных комплекта
    const initialSelectedIds = React.useMemo(() => {
        if (complect?.infoblocks) {
            return complect.infoblocks.map(ib => ib.id?.toString() || '').filter(Boolean);
        }
        return [];
    }, [complect]);

    // Управление выбором инфоблоков
    const { selectedInfoblockIds, handleInfoblockToggle } = useInfoblockSelection({
        allInfoblocks,
        initialSelectedIds,
    });

    // Группировка инфоблоков по группам
    const groupedInfoblocks = React.useMemo(() => {
        debugger
        return groupInfoblocksByGroup(allInfoblocks, infoGroups);
    }, [allInfoblocks, infoGroups]);
    debugger
    // Вычисление общего веса
    const totalWeight = React.useMemo(() => {
        return calculateTotalWeight(selectedInfoblockIds, allInfoblocks);
    }, [selectedInfoblockIds, allInfoblocks]);

    // Вес комплекта
    const complectWeight = complect?.weight ? parseFloat(complect.weight.toString()) : 0;

    // Проверка соответствия веса
    const { matches: weightMatches, difference: weightDifference } = checkWeightMatch(
        totalWeight,
        complectWeight
    );

    // Создаем карту цветов для пакетов
    const packageColorMap = React.useMemo(() => {
        return createPackageColorMap(allInfoblocks, infoGroups);
    }, [allInfoblocks, infoGroups]);

    // Функция для получения активных пакетов для инфоблока
    const getActivePackages = React.useCallback((infoblock: InfoblockListItem) => {
        return getActivePackagesForInfoblock(
            infoblock,
            selectedInfoblockIds,
            allInfoblocks,
            packageColorMap
        );
    }, [selectedInfoblockIds, allInfoblocks, packageColorMap]);

    // Обработка отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const infoblockIds = Array.from(selectedInfoblockIds).filter(id => id);

        try {
            await setInfoblocksMutation.mutateAsync({
                infoblockIds,
            });
        } catch (error) {
            console.error('Ошибка при сохранении инфоблоков:', error);
        }
    };
    return {
        complect,
        selectedInfoblockIds,
        allInfoblocks,
        infoGroups,
        packageColorMap,

        isLoadingComplect,
        isLoadingInfoblocks,
        isLoadingGroups,
        groupedInfoblocks,
        totalWeight,
        complectWeight,
        weightMatches,
        weightDifference,
        setInfoblocksMutation,
        handleInfoblockToggle,
        getActivePackages,
        handleSubmit,
    }
};
