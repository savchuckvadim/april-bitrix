import { InfoblockListItem } from '@/modules/entities/garant/infoblock/model';

/**
 * Вычисляет вес инфоблока с учетом того, входит ли он в пакет
 */
export const getInfoblockWeight = (
    infoblock: InfoblockListItem,
    selectedInfoblockIds: Set<string>,
    allInfoblocks: InfoblockListItem[]
): number => {
    const weight = parseFloat(infoblock.weight?.toString() || '0');

    // Если инфоблок входит в пакет (имеет parent_id), проверяем, выбран ли пакет
    if (infoblock.packages && infoblock.packages?.length > 0) {

        for (const parentPckg of infoblock.packages) {
            const parentId = parentPckg.id as string;
            if (selectedInfoblockIds.has(parentId)) {
                return 0;
            }
        }
        return weight;
    }

    return weight;
};

/**
 * Вычисляет общий вес выбранных инфоблоков
 */
export const calculateTotalWeight = (
    selectedInfoblockIds: Set<string>,
    allInfoblocks: InfoblockListItem[]
): number => {
    let totalWeight = 0;
    const processedInfoblocks = new Set<string>();

    selectedInfoblockIds.forEach((id) => {
        if (processedInfoblocks.has(id)) return;

        const infoblock = allInfoblocks.find(ib => ib.id === id);
        if (infoblock) {
            // Если это пакет, берем его вес
            if (infoblock.isPackage) {
                totalWeight += parseFloat(infoblock.weight?.toString() || '0');
                processedInfoblocks.add(id);
            } else {
                // Если это обычный инфоблок, проверяем, не входит ли он в выбранный пакет
                const weight = getInfoblockWeight(infoblock, selectedInfoblockIds, allInfoblocks);
                totalWeight += weight;
                processedInfoblocks.add(id);
            }
        }
    });

    return totalWeight;
};

/**
 * Проверяет соответствие веса выбранных инфоблоков весу комплекта
 */
export const checkWeightMatch = (
    totalWeight: number,
    complectWeight: number,
    tolerance: number = 0.01
): { matches: boolean; difference: number } => {
    const difference = totalWeight - complectWeight;
    const matches = Math.abs(difference) < tolerance;
    return { matches, difference };
};
