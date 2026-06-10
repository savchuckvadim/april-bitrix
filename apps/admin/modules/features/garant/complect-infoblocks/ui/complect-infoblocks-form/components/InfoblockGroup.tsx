'use client';

import * as React from 'react';
import { InfoblockListItem, InfoblockDetail, INFOBLOCK_PATH } from '@/modules/entities/garant/infoblock';
import { GroupedInfoblocks } from '../../../lib/utils/grouping.utils';
import { PackageColor } from '../../../lib/utils/package-colors.utils';
import { InfoblockItem } from './InfoblockItem';
import { InfogroupResponseDto } from '@workspace/nest-api';

interface InfoblockGroupProps {
    group: GroupedInfoblocks;
    allInfoblocks: InfoblockListItem[];
    infoGroups: InfogroupResponseDto[];
    selectedInfoblockIds: Set<string>;
    packageColorMap: Map<string, PackageColor>;
    onInfoblockToggle: (infoblockId: string, checked: boolean) => void;
    getActivePackagesForInfoblock: (
        infoblock: InfoblockListItem
    ) => Array<{ id: string; name: string; color: PackageColor }>;
}

export function InfoblockGroup({
    group,
    allInfoblocks,
    infoGroups,
    selectedInfoblockIds,
    packageColorMap,
    onInfoblockToggle,
    getActivePackagesForInfoblock,
}: InfoblockGroupProps) {
    return (
        <div key={group.groupId} className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
                {group.groupName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.infoblocks.map((infoblock) => {
                    const isSelected = selectedInfoblockIds.has(infoblock.id);
                    const weight = parseFloat(infoblock.weight?.toString() || '0');


                    // Проверяем, входит ли инфоблок в выбранный пакет
                    const isInSelectedPackage = infoblock.packages?.some(ib => selectedInfoblockIds.has(ib.id)) ?? false;
                    const displayWeight = isInSelectedPackage ? 0 : weight;

                    const isPackage = infoblock.isPackage ?? false;

                    // Проверяем, является ли это пакетом Энциклопедий решений
                    const groupInfo = infoGroups.find(g => g.id === infoblock.group_id);

                    if(groupInfo && groupInfo.code === 'per'){
                        debugger
                    }

                    const isEncyclopediaPackage = isPackage && groupInfo && groupInfo.code === 'per';
                    const packageColor = isEncyclopediaPackage ? packageColorMap.get(infoblock.id) : null;

                    // Получаем активные пакеты для ЭР
                    const activePackages = !isPackage ? getActivePackagesForInfoblock(infoblock) : [];

                    return (

                            <InfoblockItem
                                key={infoblock.id}
                                infoblock={infoblock}
                                isSelected={isSelected || isInSelectedPackage}
                                isInSelectedPackage={isInSelectedPackage ?? false}
                                displayWeight={displayWeight}
                                isPackage={isPackage}
                                childInfoblocksCount={infoblock.packageInfoblocks?.length ?? 0}
                                packageColor={packageColor ?? null}
                                activePackages={activePackages}
                                onToggle={onInfoblockToggle}
                            />

                    );
                })}
            </div>
        </div>
    );
}
