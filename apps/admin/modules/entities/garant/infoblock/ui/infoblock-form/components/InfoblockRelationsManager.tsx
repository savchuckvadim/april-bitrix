'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { InfoblockDetail } from '@/modules/entities/garant/infoblock/model';
import { useInfoGroups } from '@/modules/entities/garant/info-groups';
import {
    useSetInfoblockGroup,
} from '../../../lib/hooks/use-infoblock-relations';
import { useUpdateInfoblock, useInfoblocks, useAddInfoblockPackages, useRemoveInfoblockPackages, useRemoveFromPackages, useAddInfoblockToPackages, useSetInPackages } from '@/modules/entities/garant/infoblock/';
import { useInfoblockRelationsState } from './use-infoblock-relations-state';
import { InfoblockFlagsSection } from './InfoblockFlagsSection';
import { InfoblockGroupSection } from './InfoblockGroupSection';
import { InfoblockPackagesSection } from './InfoblockPackagesSection';
import { InfoblockPackageInfoblocksSection } from './InfoblockPackageInfoblocksSection';

interface InfoblockRelationsManagerProps {
    infoblockId: string;
    currentInfoblock: InfoblockDetail;
    onSuccess?: () => void;
}

export function InfoblockRelationsManager({
    infoblockId,
    currentInfoblock,
    onSuccess,
}: InfoblockRelationsManagerProps) {
    const { data: allInfoblocks = [], isLoading: isLoadingInfoblocks } = useInfoblocks();
    const { data: infoGroups = [], isLoading: isLoadingGroups } = useInfoGroups();
    const updateInfoblock = useUpdateInfoblock();

    const setGroupMutation = useSetInfoblockGroup();
    // const setPackagesMutation = useSetInPackages();
    const addPackagesMutation = useAddInfoblockToPackages();
    const removePackagesMutation = useRemoveFromPackages();

    // const setParentMutation = useSetInfoblockParent();
    const removeFromPackagesMutation = useRemoveInfoblockPackages();
    const addInfoblockToPackagesMutation = useAddInfoblockPackages();
    // const setInPackagesMutation = useSetInfoblockPackages();
    // Используем хук для управления состоянием
    const {
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
    } = useInfoblockRelationsState(currentInfoblock);

    // Фильтруем инфоблоки
    const availableInfoblocks = React.useMemo(() => {
        return allInfoblocks.filter(ib => ib.id !== infoblockId);
    }, [allInfoblocks, infoblockId]);

    // Пакеты (инфоблоки с isPackage: true)
    const packageInfoblocks = React.useMemo(() => {
        return availableInfoblocks.filter(ib => ib.isPackage === true);
    }, [availableInfoblocks]);

    // Инфоблоки, которые могут быть дочерними (не пакеты и не текущий)
    const availableChildInfoblocks = React.useMemo(() => {
        return availableInfoblocks.filter(ib => ib.isPackage !== true);
    }, [availableInfoblocks]);

    // Обработчики сохранения
    const handleSaveGroup = async () => {
        try {
            await setGroupMutation.mutateAsync({
                id: infoblockId,
                dto: { group_id: selectedGroupId !== NONE_VALUE ? selectedGroupId : undefined },
            });
            onSuccess?.();
        } catch (error) {
            console.error('Ошибка при сохранении группы:', error);
        }
    };

    // const handleSetPackages = async () => {
    //     try {
    //         await setPackagesMutation.mutateAsync({
    //             id: infoblockId,
    //             dto: { packageIds: Array.from(selectedPackageIds) },
    //         });
    //         onSuccess?.();
    //     } catch (error) {
    //         console.error('Ошибка при сохранении packages:', error);
    //     }
    // };

    const handleAddPackageAsync = async (packageId: string) => {
        try {
            await addPackagesMutation.mutateAsync({
                id: packageId,
                dto: { infoblockIds: [infoblockId] },
            });
            handleAddPackage(packageId);
            onSuccess?.();
        } catch (error) {
            console.error('Ошибка при добавлении пакета:', error);
        }
    };

    const handleRemovePackageAsync = async (packageId: string) => {
        try {
            await removePackagesMutation.mutateAsync({
                id: packageId,
                dto: { infoblockIds: [infoblockId] },
            });
            handleRemovePackage(packageId);
            onSuccess?.();
        } catch (error) {
            console.error('Ошибка при удалении пакета:', error);
        }
    };

    const handleSaveFlags = async () => {
        try {
            await updateInfoblock.mutateAsync({
                id: infoblockId,
                dto: {
                    number: currentInfoblock.number,
                    name: currentInfoblock.name,
                    code: currentInfoblock.code,
                    weight: currentInfoblock.weight,
                    group_id: currentInfoblock.group_id || '',
                    isLa: flags.isLa,
                    isFree: flags.isFree,
                    isShowing: currentInfoblock.isShowing,
                    isSet: flags.isSet,
                    isProduct: flags.isProduct,
                    isPackage: flags.isPackage,
                },
            });
            onSuccess?.();
        } catch (error) {
            console.error('Ошибка при сохранении флагов:', error);
        }
    };


    // Для packageInfoblocks - используем setParent для дочерних инфоблоков
    const handleAddPackageInfoblockAsync = async (childInfoblockId: string) => {
        try {
            await addInfoblockToPackagesMutation.mutateAsync({
                id: childInfoblockId,
                dto: { packageIds: [infoblockId] },
            });
            handleAddPackageInfoblock(childInfoblockId);
            onSuccess?.();
        } catch (error) {
            console.error('Ошибка при добавлении дочернего инфоблока:', error);
        }
    };

    const handleRemovePackageInfoblockAsync = async (childInfoblockId: string) => {
        try {
            // Для удаления родителя передаем пустую строку или используем специальный метод
            // Проверяем API - возможно нужен другой подход
            await removeFromPackagesMutation.mutateAsync({
                id: childInfoblockId,
                dto: { packageIds: [infoblockId] },
            });
            handleRemovePackageInfoblock(childInfoblockId);
            onSuccess?.();
        } catch (error) {
            console.error('Ошибка при удалении дочернего инфоблока:', error);
        }
    };

    const isLoading = isLoadingInfoblocks || isLoadingGroups;
    const isAnyMutationPending =
        setGroupMutation.isPending ||
        // setPackagesMutation.isPending ||
        addPackagesMutation.isPending ||
        removePackagesMutation.isPending ||
        updateInfoblock.isPending;
    // setParentMutation.isPending;


    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <InfoblockFlagsSection
                flags={flags}
                onToggleFlag={handleToggleFlag}
                onSave={handleSaveFlags}
                isLoading={updateInfoblock.isPending}
                disabled={isAnyMutationPending}
            />

            <InfoblockGroupSection
                selectedGroupId={selectedGroupId}
                onGroupChange={setSelectedGroupId}
                onSave={handleSaveGroup}
                infoGroups={infoGroups}
                currentGroup={currentInfoblock.group ? {
                    name: currentInfoblock.group.name,
                    code: currentInfoblock.group.code || '',
                } : undefined}
                isLoading={setGroupMutation.isPending}
                disabled={isAnyMutationPending}
                noneValue={NONE_VALUE}
            />
            {/* Пакеты, в которые входит текущий инфоблок */}
            {!flags.isPackage && (
                <InfoblockPackagesSection
                    selectedPackageIds={selectedPackageIds}
                    packageInfoblocks={packageInfoblocks}
                    onAddPackage={handleAddPackageAsync}
                    onRemovePackage={handleRemovePackageAsync}
                    disabled={isAnyMutationPending}
                />
            )}
            {flags.isPackage && (
                <InfoblockPackageInfoblocksSection
                    selectedPackageInfoblockIds={selectedPackageInfoblockIds}
                    availableChildInfoblocks={availableChildInfoblocks}
                    currentInfoblock={currentInfoblock}
                    onAddPackageInfoblock={handleAddPackageInfoblockAsync}
                    onRemovePackageInfoblock={handleRemovePackageInfoblockAsync}
                    disabled={isAnyMutationPending}
                />
            )}
        </div>
    );
}
