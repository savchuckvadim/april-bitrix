import * as React from 'react';
import { InfoblockListItem } from '@/modules/entities/garant/infoblock';

interface UseInfoblockSelectionProps {
    allInfoblocks: InfoblockListItem[];
    initialSelectedIds?: string[];
}

/**
 * Хук для управления выбором инфоблоков
 */
export function useInfoblockSelection({
    allInfoblocks,
    initialSelectedIds = [],
}: UseInfoblockSelectionProps) {
    const [selectedInfoblockIds, setSelectedInfoblockIds] = React.useState<Set<string>>(
        new Set(initialSelectedIds)
    );

    // Инициализация выбранных инфоблоков
    React.useEffect(() => {
        setSelectedInfoblockIds(new Set<string>(initialSelectedIds));
    }, [initialSelectedIds.join(',')]); // Используем join для стабильной зависимости

    // Обработка изменения выбора инфоблока
    const handleInfoblockToggle = React.useCallback((infoblockId: string, checked: boolean) => {
        setSelectedInfoblockIds((prev) => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(infoblockId);

                // Если выбран пакет, нужно найти все инфоблоки с parent_id = infoblockId
                allInfoblocks.forEach(ib => {
                    if (ib.packages?.some(p => p.id?.toString() === infoblockId)) {
                        newSet.add(ib.id);
                    }
                });
            } else {
                newSet.delete(infoblockId);

                // Если снят пакет, автоматически снимаем все инфоблоки в пакете
                allInfoblocks.forEach(ib => {
                    if (ib.packages?.some(p => p.id?.toString() === infoblockId)) {
                        newSet.delete(ib.id);
                    }
                });
            }
            return newSet;
        });
    }, [allInfoblocks]);

    return {
        selectedInfoblockIds,
        setSelectedInfoblockIds,
        handleInfoblockToggle,
    };
}
