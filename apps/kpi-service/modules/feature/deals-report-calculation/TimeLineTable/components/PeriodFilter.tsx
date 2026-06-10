import React from 'react';
import { PeriodFilter } from '../model/types';
import { Badge } from '@workspace/ui/components/badge';

import { Card } from '@workspace/ui/components/card';
import { YearRangePicker } from '@workspace/ui/components/year-range-picker';
import { X } from 'lucide-react';

interface PeriodFilterProps {
    filter: PeriodFilter;
    onFilterChange: (filter: Partial<PeriodFilter>) => void;
    availableUsers: Array<{ id: string; name: string }>;
    filteredCount: number;
    totalCount: number;
}

export const PeriodFilterComponent: React.FC<PeriodFilterProps> = ({
    filter,
    onFilterChange,
    availableUsers,
    filteredCount,
    totalCount
}) => {
    const handleYearRangeChange = (startYear: number, endYear: number) => {
        onFilterChange({
            startDate: new Date(startYear, 0, 1).toISOString(),
            endDate: new Date(endYear, 11, 31).toISOString(),
        });
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
                    <YearRangePicker
                        startYear={new Date(filter.startDate).getFullYear()}
                        endYear={new Date(filter.endDate).getFullYear()}
                        onChange={handleYearRangeChange}
                        className="w-full"
                    />
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
