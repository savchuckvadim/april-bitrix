'use client';

import * as React from 'react';
import { PortalContractResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';

interface PortalContractTableProps {
    data: PortalContractResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: PortalContractResponseDto) => void;
    onEdit?: (item: PortalContractResponseDto) => void;
    onDelete?: (item: PortalContractResponseDto) => void;
}

export function PortalContractTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: PortalContractTableProps) {
    const columns: Column<PortalContractResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей PortalContractResponseDto
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
            emptyMessage="portalContractses не найдены"
            onRowClick={onRowClick}
        />
    );
}
