'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { FINANCE_TYPE_FILTER_ALL } from '@/modules/entities/finance';
import type { FinanceTypeOption } from '@/modules/entities/finance';
import { useFinanceTypeFilters } from '../../hooks/use-finance-type-filters';

interface TypeSelectProps {
    label: string;
    value: string;
    options: FinanceTypeOption[];
    onChange: (value: string) => void;
}

const TypeSelect: React.FC<TypeSelectProps> = ({
    label,
    value,
    options,
    onChange,
}) => (
    <div className="flex items-center gap-1.5 text-xs">
        <span className="text-muted-foreground">{label}:</span>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-7 w-auto min-w-36 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={FINANCE_TYPE_FILTER_ALL}>Все</SelectItem>
                {options.map(option => (
                    <SelectItem key={option.code} value={option.code}>
                        {option.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);

/**
 * Фильтры «Тип договора» / «Тип клиента» вкладки «Финансы» — общие для
 * закрытых продаж и горячих клиентов (значение живёт в finance-сторе).
 * Селект не показывается, пока в данных нет ни одного значения типа.
 */
export const FinanceTypeFilters: React.FC = () => {
    const { filters, setFilter, contractTypes, clientTypes } =
        useFinanceTypeFilters();

    if (!contractTypes.length && !clientTypes.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-3">
            {contractTypes.length > 0 && (
                <TypeSelect
                    label="Тип договора"
                    value={filters.contractType}
                    options={contractTypes}
                    onChange={value => setFilter('contractType', value)}
                />
            )}
            {clientTypes.length > 0 && (
                <TypeSelect
                    label="Тип клиента"
                    value={filters.clientType}
                    options={clientTypes}
                    onChange={value => setFilter('clientType', value)}
                />
            )}
        </div>
    );
};
