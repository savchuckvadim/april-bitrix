'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { InfoblockListItem } from '@/modules/entities/garant/infoblock/model';
import { InfoblockSearchFilter, InfoblockSearchFilterState } from '@/modules/entities/garant/infoblock/ui/infoblock-list/components/InfoblockSearchFilter';

interface InfoblockSelectModalProps {
    /** Открыто ли модальное окно */
    open: boolean;
    /** Callback при закрытии модального окна */
    onOpenChange: (open: boolean) => void;
    /** Доступные инфоблоки для выбора */
    availableInfoblocks: InfoblockListItem[];
    /** Уже выбранные инфоблоки */
    selectedInfoblockIds: Set<string>;
    /** Callback при выборе инфоблоков */
    onSelect: (infoblockIds: string[]) => void;
    /** Заголовок модального окна */
    title?: string;
    /** Описание модального окна */
    description?: string;
}

/**
 * Модальное окно для выбора инфоблоков с поиском и фильтрацией
 *
 * Предоставляет удобный интерфейс для выбора инфоблоков из большого списка:
 * - Поиск по названию и коду
 * - Фильтрация по группам
 * - Фильтрация по флагам
 * - Множественный выбор с чекбоксами
 *
 * @example
 * <InfoblockSelectModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   availableInfoblocks={infoblocks}
 *   selectedInfoblockIds={selectedIds}
 *   onSelect={(ids) => {
 *     ids.forEach(id => onAddInfoblock(id));
 *   }}
 * />
 */
export function InfoblockSelectModal({
    open,
    onOpenChange,
    availableInfoblocks,
    selectedInfoblockIds,
    onSelect,
    title = 'Выбор инфоблоков',
    description = 'Выберите инфоблоки для добавления',
}: InfoblockSelectModalProps) {
    const [filters, setFilters] = React.useState<InfoblockSearchFilterState>({
        search: '',
        selectedGroups: [],
        selectedFlags: {},
    });

    const [tempSelectedIds, setTempSelectedIds] = React.useState<Set<string>>(
        new Set(selectedInfoblockIds)
    );

    // Синхронизируем временный выбор с внешним при открытии модального окна
    React.useEffect(() => {
        if (open) {
            setTempSelectedIds(new Set(selectedInfoblockIds));
            setFilters({
                search: '',
                selectedGroups: [],
                selectedFlags: {},
            });
        }
    }, [open, selectedInfoblockIds]);

    // Фильтрация инфоблоков
    const filteredInfoblocks = React.useMemo(() => {
        return availableInfoblocks.filter((infoblock) => {
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
    }, [availableInfoblocks, filters]);

    const handleToggleInfoblock = (infoblockId: string) => {
        setTempSelectedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(infoblockId)) {
                newSet.delete(infoblockId);
            } else {
                newSet.add(infoblockId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allIds = new Set(filteredInfoblocks.map(ib => ib.id));
        setTempSelectedIds(allIds);
    };

    const handleDeselectAll = () => {
        setTempSelectedIds(new Set());
    };

    const handleApply = () => {
        // Получаем только новые выбранные инфоблоки (которые еще не были выбраны)
        const newSelectedIds = Array.from(tempSelectedIds).filter(
            id => !selectedInfoblockIds.has(id)
        );
        if (newSelectedIds.length > 0) {
            onSelect(newSelectedIds);
        }
        onOpenChange(false);
    };

    const newSelectedCount = Array.from(tempSelectedIds).filter(
        id => !selectedInfoblockIds.has(id)
    ).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl w-[90vw] max-h-[95vh] h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Фильтры */}
                    <div className="flex-shrink-0">
                        <InfoblockSearchFilter
                            filters={filters}
                            onFiltersChange={setFilters}
                        />
                    </div>

                    {/* Список инфоблоков */}
                    <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b">
                            <div className="text-sm text-muted-foreground">
                                Найдено: {filteredInfoblocks.length} |
                                Выбрано: {tempSelectedIds.size} |
                                Новых: {newSelectedCount}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAll}
                                >
                                    Выбрать все
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeselectAll}
                                >
                                    Снять выбор
                                </Button>
                            </div>
                        </div>

                        {filteredInfoblocks.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                Инфоблоки не найдены
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredInfoblocks.map((infoblock) => {
                                    const isSelected = tempSelectedIds.has(infoblock.id);
                                    const isAlreadySelected = selectedInfoblockIds.has(infoblock.id);

                                    return (
                                        <div
                                            key={infoblock.id}
                                            className={`
                                                flex items-center space-x-3 p-3 rounded-lg border
                                                hover:bg-accent transition-colors
                                                ${isSelected ? 'bg-accent border-primary' : ''}
                                                ${isAlreadySelected ? 'opacity-50' : ''}
                                            `}
                                        >
                                            <Checkbox
                                                id={infoblock.id}
                                                checked={isSelected}
                                                onCheckedChange={() => handleToggleInfoblock(infoblock.id)}
                                                disabled={isAlreadySelected}
                                            />
                                            <label
                                                htmlFor={infoblock.id}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="font-medium">{infoblock.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {infoblock.code}
                                                    {infoblock.group_id && ` • Группа: ${infoblock.group_id}`}
                                                </div>
                                            </label>
                                            {isAlreadySelected && (
                                                <span className="text-xs text-muted-foreground">
                                                    Уже добавлен
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleApply}
                        disabled={newSelectedCount === 0}
                    >
                        Добавить выбранные ({newSelectedCount})
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
