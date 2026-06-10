'use client';

import * as React from 'react';
import { BtxDealResponseDto } from '@workspace/nest-api';
import { EntityCard } from '@/modules/shared';
import { btxDealCardFields } from '../../lib/utils/btx-deal-card-fields';

interface BtxDealCardProps {
    item: BtxDealResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function BtxDealCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: BtxDealCardProps) {
    return (
        <EntityCard<BtxDealResponseDto>
            entity={item}
            title={(entity) => entity.name || `BtxDeal #${entity.id}`}
            description={(entity) => entity.title || ''}
            fields={btxDealCardFields}
            onView={onViewDetails ? () => onViewDetails() : undefined}
            onEdit={onEdit ? () => onEdit() : undefined}
            onDelete={onDelete ? () => onDelete() : undefined}
            className="hover:shadow-md transition-shadow"
        />
    );
}
