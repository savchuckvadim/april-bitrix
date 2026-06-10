'use client';

import * as React from 'react';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useInfoGroups } from '@/modules/entities/garant/info-groups';

export interface InfoblockSearchFilterState {
    search: string;
    selectedGroups: string[];
    selectedFlags: {
        isPackage?: boolean;
        isProduct?: boolean;
        isFree?: boolean;
        isLa?: boolean;
        isSet?: boolean;
    };
}

interface InfoblockSearchFilterProps {
    /** Текущее состояние фильтров */
    filters: InfoblockSearchFilterState;
    /** Callback при изменении фильтров */
    onFiltersChange: (filters: InfoblockSearchFilterState) => void;
}

/**
 * Компонент поиска и фильтрации инфоблоков
 *
 * Предоставляет:
 * - Поиск по тексту (name, code)
 * - Фильтр по группам (множественный выбор)
 * - Фильтр по флагам (isPackage, isProduct, isFree, isLa, isSet)
 *
 * @example
 * const [filters, setFilters] = useState<InfoblockSearchFilterState>({
 *   search: '',
 *   selectedGroups: [],
 *   selectedFlags: {}
 * });
 *
 * <InfoblockSearchFilter
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 */
export function InfoblockSearchFilter({
    filters,
    onFiltersChange,
}: InfoblockSearchFilterProps) {
    const { data: infoGroups = [] } = useInfoGroups();
    const [isExpanded, setIsExpanded] = React.useState(true);

    const handleSearchChange = (value: string) => {
        onFiltersChange({
            ...filters,
            search: value,
        });
    };

    const toggleGroup = (groupId: string) => {
        const newGroups = filters.selectedGroups.includes(groupId)
            ? filters.selectedGroups.filter(id => id !== groupId)
            : [...filters.selectedGroups, groupId];

        onFiltersChange({
            ...filters,
            selectedGroups: newGroups,
        });
    };

    const toggleFlag = (flagName: keyof InfoblockSearchFilterState['selectedFlags']) => {
        onFiltersChange({
            ...filters,
            selectedFlags: {
                ...filters.selectedFlags,
                [flagName]: !filters.selectedFlags[flagName],
            },
        });
    };

    const flagOptions = [
        { key: 'isPackage' as const, label: 'Пакет' },
        { key: 'isProduct' as const, label: 'Продукт' },
        { key: 'isFree' as const, label: 'Бесплатный' },
        { key: 'isLa' as const, label: 'LA' },
        { key: 'isSet' as const, label: 'Набор' },
    ];

    return (
        <div className="border rounded-lg bg-muted/50">
            {/* Заголовок с кнопкой сворачивания */}
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-sm font-medium">Фильтры и поиск</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8 w-8 p-0"
                >
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Контент фильтра */}
            {isExpanded && (
                <div className="space-y-4 p-4">
                    {/* Поиск */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Поиск</label>
                        <Input
                            type="text"
                            placeholder="Поиск по названию или коду..."
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="max-w-md"
                        />
                    </div>

                    {/* Фильтр по группам */}
                    {infoGroups.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">Группы</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                {infoGroups.map((group) => {
                                    const isSelected = filters.selectedGroups.includes(group.id);
                                    return (
                                        <Badge
                                            key={group.id}
                                            variant={isSelected ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer transition-all hover:opacity-80 select-none",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                    : "hover:bg-accent hover:text-accent-foreground"
                                            )}
                                            onClick={() => toggleGroup(group.id)}
                                            role="button"
                                            tabIndex={0}
                                            aria-pressed={isSelected}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    toggleGroup(group.id);
                                                }
                                            }}
                                        >
                                            {group.name} {group.code && `(${group.code})`}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Фильтр по флагам */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Флаги</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            {flagOptions.map((option) => {
                                const isSelected = filters.selectedFlags[option.key] === true;
                                return (
                                    <Badge
                                        key={option.key}
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                            "cursor-pointer transition-all hover:opacity-80 select-none",
                                            isSelected
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "hover:bg-accent hover:text-accent-foreground"
                                        )}
                                        onClick={() => toggleFlag(option.key)}
                                        role="button"
                                        tabIndex={0}
                                        aria-pressed={isSelected}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                toggleFlag(option.key);
                                            }
                                        }}
                                    >
                                        {option.label}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
