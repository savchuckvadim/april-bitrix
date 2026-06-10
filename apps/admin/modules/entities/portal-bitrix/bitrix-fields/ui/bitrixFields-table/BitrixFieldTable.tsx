'use client';

import * as React from 'react';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';
import { PbxField } from '../../model';

interface BitrixFieldTableProps {
    data: PbxField[];
    isLoading?: boolean;
    onRowClick?: (item: PbxField) => void;
    onEdit?: (item: PbxField) => void;
    onDelete?: (item: PbxField) => void;
}

export function BitrixFieldTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BitrixFieldTableProps) {
    const columns: Column<PbxField>[] = [
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
