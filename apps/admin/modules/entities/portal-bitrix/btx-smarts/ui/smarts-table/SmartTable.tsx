'use client';

import * as React from 'react';
import { SmartResponseDto } from '@workspace/nest-api';
import { DataTable } from '@/modules/shared/ui/data-table';
import { createSmartColumns } from '../../lib/utils/btx-smart-columns';

interface SmartTableProps {
    data: SmartResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: SmartResponseDto) => void;
    onEdit?: (item: SmartResponseDto) => void;
    onDelete?: (item: SmartResponseDto) => void;
}

export function SmartTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: SmartTableProps) {
    const columns = React.useMemo(
        () =>
            createSmartColumns({
                onEdit,
                onDelete,
            }),
        [onDelete, onEdit]
    );

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Smarts не найдены"
            onRowClick={onRowClick}
        />
    );
}
