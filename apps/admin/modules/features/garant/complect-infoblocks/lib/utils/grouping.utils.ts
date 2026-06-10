import { InfoblockDetail, InfoblockListItem } from '@/modules/entities/garant/infoblock';
import { InfogroupResponseDto } from '@workspace/nest-api';

export interface GroupedInfoblocks {
    groupId: string;
    groupName: string;
    infoblocks: InfoblockListItem[];
}

/**
 * Группирует инфоблоки по группам
 */
export const groupInfoblocksByGroup = (
    allInfoblocks: InfoblockListItem[],
    infoGroups: InfogroupResponseDto[]
): GroupedInfoblocks[] => {
    if (!allInfoblocks.length) return [];

    const groupsMap = new Map<string, GroupedInfoblocks>();

    allInfoblocks.forEach((infoblock) => {
        const groupId = infoblock.group_id || 'unknown';
        const group = infoGroups.find(g => g.id === groupId);
        const groupName = group?.name || 'Без группы';

        if (!groupsMap.has(groupId)) {
            groupsMap.set(groupId, {
                groupId,
                groupName,
                infoblocks: [],
            });
        }

        groupsMap.get(groupId)!.infoblocks.push(infoblock);
    });
    debugger
    // Сортируем группы по number, а инфоблоки внутри группы тоже по number
    return Array.from(groupsMap.values())
        .map(group => {
            const groupInfo = infoGroups.find(g => g.id === group.groupId);
            return {
                ...group,
                infoblocks: group.infoblocks.sort((a, b) =>
                    (a.number || 0) - (b.number || 0)
                ),
                groupNumber: groupInfo?.number || 0,
            };
        })
        .sort((a, b) => a.groupNumber - b.groupNumber)
        .map(({ groupNumber, ...rest }) => rest);
};
