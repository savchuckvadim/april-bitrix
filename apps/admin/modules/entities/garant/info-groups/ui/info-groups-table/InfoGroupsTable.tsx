'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';
import { InfogroupResponseDto } from '../../model';

interface InfoGroupsTableProps {
    data: InfogroupResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: InfogroupResponseDto) => void;
    onEdit?: (item: InfogroupResponseDto) => void;
    onDelete?: (item: InfogroupResponseDto) => void;
}

export function InfoGroupsTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: InfoGroupsTableProps) {
    const columns: Column<InfogroupResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'name',
            header: 'Name',
            accessorKey: 'name',
            className: 'w-20',
        },

        {
            id: 'productType',
            header: 'productType',
            accessorKey: 'productType',
            className: 'w-20',
        },
        {
            id: 'type',
            header: 'type',
            accessorKey: 'type',
            className: 'w-20',
        },
        {
            id: 'code',
            header: 'code',
            accessorKey: 'code',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей InfogroupResponseDto
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
            emptyMessage="info-groups не найдены"
            onRowClick={onRowClick}
        />
    );
}
