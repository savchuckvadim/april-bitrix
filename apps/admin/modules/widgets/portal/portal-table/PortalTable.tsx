'use client';

import * as React from 'react';
import { AdminPortalResponseDto } from '@workspace/nest-admin-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';
import { useRouter } from 'next/navigation';

interface PortalTableProps {
    data: AdminPortalResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: AdminPortalResponseDto) => void;
    onEdit?: (item: AdminPortalResponseDto) => void;
    onDelete?: (item: AdminPortalResponseDto) => void;
}

export function PortalTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: PortalTableProps) {
    const columns: Column<AdminPortalResponseDto>[] = [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            className: 'w-20',
        },
        {
            id: 'domain',
            header: 'Domain',
            accessorKey: 'domain',
            className: 'w-20',
        },
        {
            id: 'client_id',
            header: 'Client ID',
            accessorKey: 'client_id',
            className: 'w-20',
        },
        {
            id: 'updated_at',
            header: 'Updated at',
            accessorKey: 'updated_at',
            className: 'w-20',
        },
        // TODO: Добавьте колонки на основе полей AdminPortalResponseDto
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
    const router = useRouter();
    
    const handleRowClick = (item: AdminPortalResponseDto) => {
        router.push(`/portal/${item.id}`);
        onRowClick?.(item);
    }
    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="portals не найдены"
            onRowClick={handleRowClick}
        />
    );
}
