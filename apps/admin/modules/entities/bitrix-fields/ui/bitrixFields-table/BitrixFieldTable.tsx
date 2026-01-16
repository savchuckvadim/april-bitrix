'use client';

import * as React from 'react';
import { BitrixFieldResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface BitrixFieldTableProps {
    data: BitrixFieldResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BitrixFieldResponseDto) => void;
    onEdit?: (item: BitrixFieldResponseDto) => void;
    onDelete?: (item: BitrixFieldResponseDto) => void;
}

export function BitrixFieldTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BitrixFieldTableProps) {
    const columns: Column<BitrixFieldResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей BitrixFieldResponseDto
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
            emptyMessage="bitrixFieldses не найдены"
            onRowClick={onRowClick}
        />
    );
}
