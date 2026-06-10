import { InfoblockDetail, InfoblockListItem } from '@/modules/entities/garant/infoblock';
import { InfogroupResponseDto } from '@workspace/nest-api';

export interface PackageColor {
    borderColor: string;
    textColor: string;
    name: string;
    borderColorRgb: string;
}

/**
 * Цвета для пакетов Энциклопедий решений
 */
export const PACKAGE_COLORS: PackageColor[] = [
    { borderColor: 'border-blue-500', textColor: 'text-blue-700 dark:text-blue-400', name: 'Синий', borderColorRgb: 'rgb(59 130 246)' },
    { borderColor: 'border-green-500', textColor: 'text-green-700 dark:text-green-400', name: 'Зеленый', borderColorRgb: 'rgb(34 197 94)' },
    { borderColor: 'border-purple-500', textColor: 'text-purple-700 dark:text-purple-400', name: 'Фиолетовый', borderColorRgb: 'rgb(168 85 247)' },
    { borderColor: 'border-orange-500', textColor: 'text-orange-700 dark:text-orange-400', name: 'Оранжевый', borderColorRgb: 'rgb(249 115 22)' },
    { borderColor: 'border-pink-500', textColor: 'text-pink-700 dark:text-pink-400', name: 'Розовый', borderColorRgb: 'rgb(236 72 153)' },
    { borderColor: 'border-cyan-500', textColor: 'text-cyan-700 dark:text-cyan-400', name: 'Голубой', borderColorRgb: 'rgb(6 182 212)' },
];

/**
 * Создает карту цветов для пакетов Энциклопедий решений
 *
 * Пакет определяется по наличию дочерних инфоблоков в packageInfoblocks
 */
export const createPackageColorMap = (
    allInfoblocks: InfoblockListItem[],
    infoGroups: InfogroupResponseDto[]
): Map<string, PackageColor> => {
    const map = new Map<string, PackageColor>();
    let colorIndex = 0;

    allInfoblocks.forEach((infoblock) => {
        // Проверяем, является ли инфоблок пакетом (имеет дочерние инфоблоки)
        const isPackage = (infoblock.packageInfoblocks?.length ?? 0) > 0;

        if (isPackage) {
            const group = infoGroups.find(g => g.id === infoblock.group_id);
            // Проверяем, является ли это пакетом Энциклопедий решений
            if (group && group.code === 'per' && !map.has(infoblock.id)) {
                const colorIndexMod = colorIndex % PACKAGE_COLORS.length;
                const color = PACKAGE_COLORS[colorIndexMod];
                if (color) {
                    map.set(infoblock.id, color);
                    colorIndex++;
                }
            }
        }
    });

    return map;
};

/**
 * Получает активные пакеты для инфоблока
 *
 * Пакеты берутся из поля packages инфоблока (пакеты, в которые входит текущий инфоблок)
 * и фильтруются по selectedInfoblockIds
 */
export const getActivePackagesForInfoblock = (
    infoblock: InfoblockListItem,
    selectedInfoblockIds: Set<string>,
    allInfoblocks: InfoblockListItem[],
    packageColorMap: Map<string, PackageColor>
): Array<{ id: string; name: string; color: PackageColor }> => {
    // Если у инфоблока нет пакетов, возвращаем пустой массив
    if (!infoblock.packages || infoblock.packages.length === 0) {
        return [];
    }

    const activePackages: Array<{ id: string; name: string; color: PackageColor }> = [];

    // Проходим по всем пакетам, в которые входит этот инфоблок
    infoblock.packages.forEach((pkg) => {
        // Проверяем, выбран ли пакет и есть ли для него цвет
        if (selectedInfoblockIds.has(pkg.id)) {
            const color = packageColorMap.get(pkg.id);
            if (color) {
                activePackages.push({
                    id: pkg.id,
                    name: pkg.name,
                    color,
                });
            }
        }
    });

    return activePackages;
};
