'use client';

import * as React from 'react';
import { InfoblockDetail } from '../../../model';

const NONE_VALUE = '__none__';

export function useInfoblockRelationsState(currentInfoblock: InfoblockDetail) {
    // Состояния для выбранных значений
    const [selectedGroupId, setSelectedGroupId] = React.useState<string>(
        currentInfoblock.group_id || NONE_VALUE
    );

    // Состояния для packages (пакеты, в которые входит текущий инфоблок)
    const [selectedPackageIds, setSelectedPackageIds] = React.useState<Set<string>>(
        new Set(currentInfoblock.packages?.map(p => p.id) || [])
    );

    // Состояния для packageInfoblocks (дочерние инфоблоки, если текущий - пакет)
    const [selectedPackageInfoblockIds, setSelectedPackageInfoblockIds] = React.useState<Set<string>>(
        new Set(currentInfoblock.packageInfoblocks?.map(p => p.id) || [])
    );

    // Состояния для флагов
    const [flags, setFlags] = React.useState({
        isProduct: currentInfoblock.isProduct ?? false,
        isFree: currentInfoblock.isFree ?? false,
        isLa: currentInfoblock.isLa ?? false,
        isPackage: currentInfoblock.isPackage ?? false,
        isSet: currentInfoblock.isSet ?? false,
    });

    // Обновляем состояния при изменении currentInfoblock
    React.useEffect(() => {
        setSelectedGroupId(currentInfoblock.group_id || NONE_VALUE);
        setSelectedPackageIds(new Set(currentInfoblock.packages?.map(p => p.id) || []));
        setSelectedPackageInfoblockIds(new Set(currentInfoblock.packageInfoblocks?.map(p => p.id) || []));
        setFlags({
            isProduct: currentInfoblock.isProduct ?? false,
            isFree: currentInfoblock.isFree ?? false,
            isLa: currentInfoblock.isLa ?? false,
            isPackage: currentInfoblock.isPackage ?? false,
            isSet: currentInfoblock.isSet ?? false,
        });
    }, [currentInfoblock]);

    const handleToggleFlag = (flagName: keyof typeof flags) => {
        setFlags(prev => ({
            ...prev,
            [flagName]: !prev[flagName],
        }));
    };

    const handleAddPackage = (packageId: string) => {
        setSelectedPackageIds(prev => new Set([...prev, packageId]));
    };

    const handleRemovePackage = (packageId: string) => {
        setSelectedPackageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(packageId);
            return newSet;
        });
    };

    const handleAddPackageInfoblock = (childInfoblockId: string) => {
        setSelectedPackageInfoblockIds(prev => new Set([...prev, childInfoblockId]));
    };

    const handleRemovePackageInfoblock = (childInfoblockId: string) => {
        setSelectedPackageInfoblockIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(childInfoblockId);
            return newSet;
        });
    };

    return {
        NONE_VALUE,
        selectedGroupId,
        setSelectedGroupId,
        selectedPackageIds,
        selectedPackageInfoblockIds,
        flags,
        handleToggleFlag,
        handleAddPackage,
        handleRemovePackage,
        handleAddPackageInfoblock,
        handleRemovePackageInfoblock,
    };
}
