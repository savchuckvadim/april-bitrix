'use client';

import * as React from 'react';
import { BtxCategoryResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface BtxCategorieTableProps {
    data: BtxCategoryResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BtxCategoryResponseDto) => void;
    onEdit?: (item: BtxCategoryResponseDto) => void;
    onDelete?: (item: BtxCategoryResponseDto) => void;
}

export function BtxCategorieTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BtxCategorieTableProps) {
    const columns: Column<BtxCategoryResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей BtxCategoryResponseDto
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
            emptyMessage="btxCategorieses не найдены"
            onRowClick={onRowClick}
        />
    );
}
