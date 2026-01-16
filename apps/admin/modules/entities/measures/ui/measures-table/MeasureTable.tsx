'use client';

import * as React from 'react';
import { MeasureResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface MeasureTableProps {
    data: MeasureResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: MeasureResponseDto) => void;
    onEdit?: (item: MeasureResponseDto) => void;
    onDelete?: (item: MeasureResponseDto) => void;
}

export function MeasureTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: MeasureTableProps) {
    const columns: Column<MeasureResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей MeasureResponseDto
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
            emptyMessage="measureses не найдены"
            onRowClick={onRowClick}
        />
    );
}
