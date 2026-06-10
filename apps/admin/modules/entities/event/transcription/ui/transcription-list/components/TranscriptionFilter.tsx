'use client';

import * as React from 'react';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { cn } from '@workspace/ui/lib/utils';
import { TranscriptionFilterState } from '../../../lib/hooks/use-transcription-filter';

interface TranscriptionFilterProps {
    filters: TranscriptionFilterState;
    onFiltersChange: (filters: TranscriptionFilterState) => void;
    filterOptions: {
        domains: Array<{ id: string; label: string }>;
        users: Array<{ id: string; label: string }>;
        providers: Array<{ id: string; label: string }>;
        statuses: Array<{ id: string; label: string }>;
        entityTypes: Array<{ id: string; label: string }>;
        apps: Array<{ id: string; label: string }>;
        departments: Array<{ id: string; label: string }>;
    };
}

export function TranscriptionFilter({
    filters,
    onFiltersChange,
    filterOptions,
}: TranscriptionFilterProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const toggleFilter = (
        value: string,
        selected: string[],
        field: keyof TranscriptionFilterState
    ) => {
        const newSelected = selected.includes(value)
            ? selected.filter((v) => v !== value)
            : [...selected, value];

        onFiltersChange({
            ...filters,
            [field]: newSelected,
        });
    };

    const handleSearchChange = (value: string) => {
        onFiltersChange({
            ...filters,
            search: value,
        });
    };

    const renderFilterSection = (
        title: string,
        options: Array<{ id: string; label: string }>,
        selected: string[],
        field: keyof TranscriptionFilterState
    ) => {
        if (options.length === 0) return null;

        return (
            <div className="space-y-2">
                <h3 className="text-sm font-medium">{title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    {options.map((option) => {
                        const isSelected = selected.includes(option.id);
                        return (
                            <Badge
                                key={option.id}
                                variant={isSelected ? 'default' : 'outline'}
                                className={cn(
                                    'cursor-pointer transition-all hover:opacity-80 select-none',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : 'hover:bg-accent hover:text-accent-foreground'
                                )}
                                onClick={() => toggleFilter(option.id, selected, field)}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        toggleFilter(option.id, selected, field);
                                    }
                                }}
                            >
                                {option.label}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            {/* Поиск */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Поиск</h3>
                <Input
                    placeholder="Поиск по тексту, пользователю, сущности, домену..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="max-w-md"
                />
            </div>

            {/* Основные фильтры (всегда видимые) */}
            {renderFilterSection(
                'Домены',
                filterOptions.domains,
                filters.selectedDomains,
                'selectedDomains'
            )}
            {renderFilterSection(
                'Пользователи',
                filterOptions.users,
                filters.selectedUsers,
                'selectedUsers'
            )}
            {renderFilterSection(
                'Провайдеры',
                filterOptions.providers,
                filters.selectedProviders,
                'selectedProviders'
            )}
            {renderFilterSection(
                'Статусы',
                filterOptions.statuses,
                filters.selectedStatuses,
                'selectedStatuses'
            )}

            {/* Дополнительные фильтры (сворачиваемые) */}
            {isExpanded && (
                <>
                    {renderFilterSection(
                        'Типы сущностей',
                        filterOptions.entityTypes,
                        filters.selectedEntityTypes,
                        'selectedEntityTypes'
                    )}
                    {renderFilterSection(
                        'Приложения',
                        filterOptions.apps,
                        filters.selectedApps,
                        'selectedApps'
                    )}
                    {renderFilterSection(
                        'Отделы',
                        filterOptions.departments,
                        filters.selectedDepartments,
                        'selectedDepartments'
                    )}
                </>
            )}

            {/* Кнопка развернуть/свернуть */}
            {(filterOptions.entityTypes.length > 0 ||
                filterOptions.apps.length > 0 ||
                filterOptions.departments.length > 0) && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        {isExpanded ? 'Свернуть' : 'Развернуть'} дополнительные фильтры
                    </button>
                )}
        </div>
    );
}
