'use client';

import * as React from 'react';
import { PortalMeasureResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface PortalMeasureTableProps {
    data: PortalMeasureResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: PortalMeasureResponseDto) => void;
    onEdit?: (item: PortalMeasureResponseDto) => void;
    onDelete?: (item: PortalMeasureResponseDto) => void;
}

export function PortalMeasureTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: PortalMeasureTableProps) {
    const columns: Column<PortalMeasureResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей PortalMeasureResponseDto
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
            emptyMessage="portalMeasureses не найдены"
            onRowClick={onRowClick}
        />
    );
}
