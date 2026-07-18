'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';
import { GetComplectResponseDto, GetSupplyResponseDto } from '@workspace/nest-admin-api';
import { PriceEntity } from '../../model';

interface ProfPricesTableProps {
    data: PriceEntity[];
    isLoading?: boolean;
    onRowClick?: (item: PriceEntity) => void;
    onEdit?: (item: PriceEntity) => void;
    onDelete?: (item: PriceEntity) => void;
    complects?: GetComplectResponseDto[];
    supplies?: GetSupplyResponseDto[];
}

export function ProfPricesTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
    complects = [],
    supplies = [],
}: ProfPricesTableProps) {
    const getComplectName = (id?: number | string | unknown) => {
        if (!id) return '-';
        const idStr = String(id);
        const complect = complects.find((c) => c.id === idStr || c.id === String(id));
        return complect?.name || complect?.shortName || `ID: ${idStr}`;
    };

    const getSupplyName = (id?: number | string | unknown) => {
        if (!id) return '-';

        console.log(supplies);
        const idNum = typeof id === 'number' ? id : Number(id);
        const supply = supplies.find((s) => Number(s.id) === idNum);
        if (!supply) return `ID: ${idNum}`;
        // Используем fullName в приоритете, затем name, затем shortName
        return supply.fullName || supply.name || supply.shortName || `ID: ${idNum}`;
    };

    const getRegionName = (regionType?: string | number | unknown) => {
        const type = String(regionType || '');
        if (type === '0') return 'Москва';
        if (type === '1') return 'Регионы';
        return type || '-';
    };

    const getSupplyTypeName = (supplyType?: string | unknown) => {
        const type = String(supplyType || '');
        if (type === 'internet') return 'Интернет';
        if (type === 'proxima') return 'Проксима';
        return type || '-';
    };

    const columns: Column<PriceEntity>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'region_type',
            header: 'Тип региона',
            cell: (row) => {
                const originalValue = row.region_type;
                const name = getRegionName(originalValue);
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{String(originalValue || '-')}</span>
                        <span className="text-sm text-muted-foreground">{name}</span>
                    </div>
                );
            },
            className: 'w-32',
        },
        {
            id: 'value',
            header: 'Значение',
            accessorKey: 'value',
            className: 'w-20',
        },
        {
            id: 'discount',
            header: 'Скидка',
            accessorKey: 'discount',
            className: 'w-20',
        },
        {
            id: 'complect_id',
            header: 'Комплект',
            cell: (row) => {
                const id = row.complect_id;
                const name = getComplectName(id);
                if (!id) return '-';
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">ID: {String(id)}</span>
                        <span className="text-sm text-muted-foreground">{name}</span>
                    </div>
                );
            },
            className: 'w-40',
        },

        {
            id: 'supply_id',
            header: 'Поставка',
            cell: (row) => {
                const id = row.supply_id;
                const name = getSupplyName(id);
                if (!id) return '-';
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">ID: {String(id)}</span>
                        <span className="text-sm text-muted-foreground">{name}</span>
                    </div>
                );
            },
            className: 'w-40',
        },
        {
            id: 'supply_type',
            header: 'Тип поставки',
            cell: (row) => {
                const originalValue = row.supply_type;
                const name = getSupplyTypeName(originalValue);
                if (!originalValue) return '-';
                return (
                    <div className="flex flex-col">
                        <span className="font-medium">{String(originalValue)}</span>
                        <span className="text-sm text-muted-foreground">{name}</span>
                    </div>
                );
            },
            className: 'w-32',
        },
        {
            id: 'actions',
            header: 'Действия',
            cell: (row) => (
                <div className="flex gap-2">
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(row);
                            }}
                        >
                            Изменить
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(row);
                            }}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            ),
            className: 'w-48',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="prof prices не найдены"
            onRowClick={onRowClick}
        />
    );
}
