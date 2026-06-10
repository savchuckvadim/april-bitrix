'use client';

import * as React from 'react';
import { BtxDealResponseDto } from '@workspace/nest-api';
import { DataTable } from '@/modules/shared/ui/data-table';
import { createBtxDealColumns } from '../../lib/utils/btx-deal-columns';

interface BtxDealTableProps {
    data: BtxDealResponseDto[];
    isLoading?: boolean;
    onRowClick?: (item: BtxDealResponseDto) => void;
    onEdit?: (item: BtxDealResponseDto) => void;
    onDelete?: (item: BtxDealResponseDto) => void;
}

export function BtxDealTable({
    data,
    isLoading,
    onRowClick,
    onEdit,
    onDelete,
}: BtxDealTableProps) {
    const columns = React.useMemo(
        () =>
            createBtxDealColumns({
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
            emptyMessage="BtxDeals не найдены"
            onRowClick={onRowClick}
        />
    );
}
