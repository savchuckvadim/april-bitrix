'use client';

import * as React from 'react';
import { BxRqResponseDto } from '@workspace/nest-api';
import { DataTable, Column } from '@/modules/shared/ui/data-table';
import { Button } from '@workspace/ui/components/button';
import { getBxRqColumns } from '../../lib/utils/get-bx-rq-columns.util';

interface BxRqTableProps {
    data: BxRqResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BxRqResponseDto) => void;
    onEdit?: (item: BxRqResponseDto) => void;
    onDelete?: (item: BxRqResponseDto) => void;
}

export function BxRqTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BxRqTableProps) {
    const columns: Column<BxRqResponseDto>[] = getBxRqColumns(onEdit, onDelete);

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="bxRqses не найдены"
            onRowClick={onRowClick}
        />
    );
}
