'use client';

import * as React from 'react';
import { BitrixAppDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface BitrixAppTableProps {
    data: BitrixAppDto[];
    isLoading?: boolean;
    onRowClick?: (item: BitrixAppDto) => void;
    onEdit?: (item: BitrixAppDto) => void;
    onDelete?: (item: BitrixAppDto) => void;
}

export function BitrixAppTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BitrixAppTableProps) {
    const columns: Column<BitrixAppDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
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
            emptyMessage="bitrixApps не найдены"
            onRowClick={onRowClick}
        />
    );
}
