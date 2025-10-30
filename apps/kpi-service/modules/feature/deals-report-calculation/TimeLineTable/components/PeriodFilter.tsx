import React from 'react';
import { PeriodFilter } from '../model/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';

import { Card } from '@workspace/ui/components/card';
import { X } from 'lucide-react';

interface PeriodFilterProps {
    filter: PeriodFilter;
    onFilterChange: (filter: Partial<PeriodFilter>) => void;
    availableYears: number[];
    availableUsers: Array<{ id: string; name: string }>;
    filteredCount: number;
    totalCount: number;
}

export const PeriodFilterComponent: React.FC<PeriodFilterProps> = ({
    filter,
    onFilterChange,
    availableYears,
    availableUsers,
    filteredCount,
    totalCount
}) => {
    const currentYear = new Date().getFullYear();
    const maxYear = Math.max(...availableYears, currentYear + 2);

    const handleStartYearChange = (year: string) => {
        const startDate = new Date(+year, 0, 1).toISOString();
        const endDate = new Date(filter.endDate);

        // Если новая начальная дата после конечной, обновляем конечную
        if (new Date(startDate) > endDate) {
            const newEndDate = new Date(+year, 11, 31).toISOString();
            onFilterChange({
                startDate,
                endDate: newEndDate
            });
        } else {
            onFilterChange({ startDate });
        }
    };

    const handleEndYearChange = (year: string) => {
        const endDate = new Date(+year, 11, 31).toISOString();
        const startDate = new Date(filter.startDate);

        // Если новая конечная дата до начальной, обновляем начальную
        if (new Date(endDate) < startDate) {
            const newStartDate = new Date(+year, 0, 1).toISOString();
            onFilterChange({
                startDate: newStartDate,
                endDate
            });
        } else {
            onFilterChange({ endDate });
        }
    };

    const handleUserToggle = (userId: string) => {
        const currentUsers = filter.assignedUsers;
        const newUsers = currentUsers.includes(userId)
            ? currentUsers.filter(id => id !== userId)
            : [...currentUsers, userId];
        onFilterChange({ assignedUsers: newUsers });
    };

    const handleClearAllFilters = () => {
        onFilterChange({
            clientStatus: 'all',
            indexStatus: 'all',
            assignedUsers: []
        });
    };

    const hasActiveFilters =
        filter.clientStatus !== 'all' ||
        filter.indexStatus !== 'all' ||
        filter.assignedUsers.length > 0;

    const clientStatusOptions = [
        { value: 'all' as const, label: 'Все' },
        { value: 'active' as const, label: 'Активные' },
        { value: 'inactive' as const, label: 'Неактивные' }
    ];

    const indexStatusOptions = [
        { value: 'all' as const, label: 'Все' },
        { value: 'growing' as const, label: 'Растущие' },
        { value: 'declining' as const, label: 'Падающие' },
        { value: 'stable' as const, label: 'Стабильные' }
    ];

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-primary">Фильтры</h3>
                    <Badge variant="secondary" className="text-sm font-medium">
                        {filteredCount} из {totalCount} компаний
                    </Badge>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearAllFilters}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        Очистить все
                    </button>
                )}
            </div>

            <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Период */}
                <div>
                    <h4 className="text-sm font-medium text-primary/70 mb-2">Период</h4>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-primary/70">С:</label>
                        <Select
                            value={new Date(filter.startDate).getFullYear().toString()}
                            onValueChange={handleStartYearChange}
                        >
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <label className="text-sm text-primary/70">По:</label>
                        <Select
                            value={new Date(filter.endDate).getFullYear().toString()}
                            onValueChange={handleEndYearChange}
                        >
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: maxYear - new Date(filter.startDate).getFullYear() + 1 }, (_, i) => {
                                    const year = new Date(filter.startDate).getFullYear() + i;
                                    return (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Статус клиентов */}
                <div>
                    <h4 className="text-sm font-medium text-primary/70 mb-2">Статус клиентов</h4>
                    <div className="flex flex-wrap gap-2">
                        {clientStatusOptions.map(option => (
                            <Badge
                                key={option.value}
                                variant={filter.clientStatus === option.value ? "default" : "secondary"}
                                className="cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => onFilterChange({ clientStatus: option.value })}
                            >
                                {option.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Индексация */}
                <div>
                    <h4 className="text-sm font-medium text-primary/70 mb-2">Индексация</h4>
                    <div className="flex flex-wrap gap-2">
                        {indexStatusOptions.map(option => (
                            <Badge
                                key={option.value}
                                variant={filter.indexStatus === option.value ? "default" : "secondary"}
                                className="cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => onFilterChange({ indexStatus: option.value })}
                            >
                                {option.label}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Пользователи */}
                {availableUsers.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-primary/70 mb-2">Пользователи</h4>
                        <div className="flex flex-wrap gap-2">
                            {availableUsers.map(user => (
                                <Badge
                                    key={user.id}
                                    variant={filter.assignedUsers.includes(user.id) ? "default" : "secondary"}
                                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => handleUserToggle(user.id)}
                                >
                                    {user.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>





        </Card>
    );
};
