'use client'

import React, { useMemo } from 'react';
import { IUserReportItem } from "../../type/user-report.type";
import { Badge } from "@workspace/ui/components/badge";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { X, Building2 } from 'lucide-react';

interface UserReportFiltersProps {
    report: IUserReportItem[];
    selectedFilters: {
        action?: string;
        type?: string;
        initiative?: string;
        communication?: string;
    };
    onFilterChange: (filters: {
        action?: string;
        type?: string;
        initiative?: string;
        communication?: string;
    }) => void;
    groupByCompany: boolean;
    onGroupByCompanyChange: (groupBy: boolean) => void;
}

interface FilterOption {
    code: string;
    name: string;
    count: number;
}

export const UserReportFilters: React.FC<UserReportFiltersProps> = ({
    report,
    selectedFilters,
    onFilterChange,
    groupByCompany,
    onGroupByCompanyChange
}) => {
    const filterOptions = useMemo(() => {
        const actionMap = new Map<string, number>();
        const typeMap = new Map<string, number>();
        const initiativeMap = new Map<string, number>();
        const communicationMap = new Map<string, number>();

        report.forEach(item => {
            // Action filter
            const actionCode = item.sales_kpi_event_action?.value?.code;
            const actionName = item.sales_kpi_event_action?.value?.name;
            if (actionCode && actionName) {
                actionMap.set(actionCode, (actionMap.get(actionCode) || 0) + 1);
            }

            // Type filter
            const typeCode = item.sales_kpi_event_type?.value?.code;
            const typeName = item.sales_kpi_event_type?.value?.name;
            if (typeCode && typeName) {
                typeMap.set(typeCode, (typeMap.get(typeCode) || 0) + 1);
            }

            // // Initiative filter
            // const initiativeCode = item.sales_kpi_event_initiative?.value?.code;
            // const initiativeName = item.sales_kpi_event_initiative?.value?.name;
            // if (initiativeCode && initiativeName) {
            //     initiativeMap.set(initiativeCode, (initiativeMap.get(initiativeCode) || 0) + 1);
            // }

            // // Communication filter
            // const communicationCode = item.service_ork_history_event_communication?.value?.code;
            // const communicationName = item.service_ork_history_event_communication?.value?.name;
            // if (communicationCode && communicationName) {
            //     communicationMap.set(communicationCode, (communicationMap.get(communicationCode) || 0) + 1);
            // }
        });

        return {
            actions: Array.from(actionMap.entries()).map(([code, count]) => ({
                code,
                name: report.find(item => item.sales_kpi_event_action?.value?.code === code)?.sales_kpi_event_action?.value?.name || code,
                count
            })),
            types: Array.from(typeMap.entries()).map(([code, count]) => ({
                code,
                name: report.find(item => item.sales_kpi_event_type?.value?.code === code)?.sales_kpi_event_type?.value?.name || code,
                count
            })),
            // initiatives: Array.from(initiativeMap.entries()).map(([code, count]) => ({
            //     code,
            //     name: report.find(item => item.service_ork_history_ork_event_initiative?.value?.code === code)?.service_ork_history_ork_event_initiative?.value?.name || code,
            //     count
            // })),
            // communications: Array.from(communicationMap.entries()).map(([code, count]) => ({
            //     code,
            //     name: report.find(item => item.service_ork_history_event_communication?.value?.code === code)?.service_ork_history_event_communication?.value?.name || code,
            //     count
            // }))
        };
    }, [report]);

    const handleFilterToggle = (filterType: keyof typeof selectedFilters, code: string) => {
        const currentValue = selectedFilters[filterType];
        const newValue = currentValue === code ? undefined : code;

        onFilterChange({
            ...selectedFilters,
            [filterType]: newValue
        });
    };

    const clearAllFilters = () => {
        onFilterChange({});
    };

    const hasActiveFilters = Object.values(selectedFilters).some(Boolean);

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
                <div className="flex items-center gap-3">
                    <Button
                        variant={groupByCompany ? "default" : "outline"}
                        size="sm"
                        onClick={() => onGroupByCompanyChange(!groupByCompany)}
                        className="flex items-center gap-2"
                    >
                        <Building2 className="w-4 h-4" />
                        Группировать по компаниям
                    </Button>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            <X className="w-4 h-4" />
                            Очистить все
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {/* Action Filter */}
                {filterOptions.actions.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Действие</h4>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.actions.map(option => (
                                <Badge
                                    key={option.code}
                                    variant={selectedFilters.action === option.code ? "default" : "secondary"}
                                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => handleFilterToggle('action', option.code)}
                                >
                                    {option.name} ({option.count})
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Type Filter */}
                {filterOptions.types.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Тип</h4>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.types.map(option => (
                                <Badge
                                    key={option.code}
                                    variant={selectedFilters.type === option.code ? "default" : "secondary"}
                                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => handleFilterToggle('type', option.code)}
                                >
                                    {option.name} ({option.count})
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Initiative Filter */}
                {/* {filterOptions.initiatives.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Инициатива</h4>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.initiatives.map(option => (
                                <Badge
                                    key={option.code}
                                    variant={selectedFilters.initiative === option.code ? "default" : "secondary"}
                                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => handleFilterToggle('initiative', option.code)}
                                >
                                    {option.name} ({option.count})
                                </Badge>
                            ))}
                        </div>
                    </div>
                )} */}

                {/* Communication Filter 
                {filterOptions.communications.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Коммуникация</h4>
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.communications.map(option => (
                                <Badge
                                    key={option.code}
                                    variant={selectedFilters.communication === option.code ? "default" : "secondary"}
                                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => handleFilterToggle('communication', option.code)}
                                >
                                    {option.name} ({option.count})
                                </Badge>
                            ))}
                        </div>
                    </div>
                )} */}
            </div>
        </Card>
    );
};
