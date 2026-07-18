'use client';

import * as React from 'react';
import { ContractResponseDto } from '@workspace/nest-admin-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface ContractTableProps {
    data: ContractResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: ContractResponseDto) => void;
    onEdit?: (item: ContractResponseDto) => void;
    onDelete?: (item: ContractResponseDto) => void;
}

export function ContractTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: ContractTableProps) {
    const columns: Column<ContractResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'name',
            header: 'Название',
            accessorKey: 'name',
            className: 'w-40',
        },
        {
            id: 'description',
            header: 'Описание',
            accessorKey: 'description',
            className: 'w-40',
        },
        {
            id: 'coefficient',
            header: 'Дата создания',
            accessorKey: 'coefficient',
            className: 'w-40',
        },
        {
            id: 'prepayment',
            header: 'Предоплата',
            accessorKey: 'prepayment',
            className: 'w-40',
        },
        {
            id: 'discount',
            header: 'Скидка',
            accessorKey: 'discount',
            className: 'w-40',
        },
        {
            id: 'withPrepayment',
            header: 'С предоплатой',
            accessorKey: 'withPrepayment',
            className: 'w-40',
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
            emptyMessage="contractses не найдены"
            onRowClick={onRowClick}
        />
    );
}
