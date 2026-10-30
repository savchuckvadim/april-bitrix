'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { GetSupplyResponseDto } from '@workspace/nest-admin-api';
import {
    SUPPLY_FIELDS,
    SUPPLY_TABLE_PRIMARY_KEYS,
    SUPPLY_TEXT_KEYS,
    countFilledTexts,
} from '../../model/supply-fields';

interface SuppliesTableProps {
    data: GetSupplyResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: GetSupplyResponseDto) => void;
    onEdit?: (item: GetSupplyResponseDto) => void;
    onDelete?: (item: GetSupplyResponseDto) => void;
    /**
     * Показать все колонки, включая тексты договоров. По умолчанию
     * таблица узкая: 26 колонок читать неудобно, а тексты длинные.
     */
    showAllColumns?: boolean;
}

/** Значение ячейки: пустое поле показываем прочерком, а не пустотой */
const cellText = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
};

export function SuppliesTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
    showAllColumns = false,
}: SuppliesTableProps) {
    const shown = showAllColumns
        ? SUPPLY_FIELDS
        : SUPPLY_FIELDS.filter(field =>
              SUPPLY_TABLE_PRIMARY_KEYS.includes(field.key),
          );

    const columns: Column<GetSupplyResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-16',
        },
        ...shown.map(
            (field): Column<GetSupplyResponseDto> => ({
                id: field.key,
                header: field.label,
                cell: row => (
                    <span
                        className={
                            field.kind === 'long'
                                ? 'block max-w-xs truncate text-muted-foreground'
                                : undefined
                        }
                        title={
                            field.kind === 'long'
                                ? cellText(row[field.key])
                                : undefined
                        }
                    >
                        {cellText(row[field.key])}
                    </span>
                ),
                className: field.kind === 'long' ? 'max-w-xs' : 'w-28',
            }),
        ),
        // Сразу видно, у каких поставок тексты договоров не заполнены
        {
            id: 'texts',
            header: 'Тексты',
            cell: row => {
                const filled = countFilledTexts(row);
                const total = SUPPLY_TEXT_KEYS.length;
                return (
                    <Badge
                        variant={
                            filled === 0
                                ? 'destructive'
                                : filled < total
                                  ? 'secondary'
                                  : 'default'
                        }
                    >
                        {filled} из {total}
                    </Badge>
                );
            },
            className: 'w-28',
        },
        {
            id: 'actions',
            header: 'Действия',
            cell: row => (
                <div className="flex gap-2">
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={e => {
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
                            onClick={e => {
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
            emptyMessage="Виды поставок не найдены"
            onRowClick={onRowClick}
        />
    );
}
