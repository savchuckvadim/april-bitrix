'use client';

import { SmartResponseDto } from '@workspace/nest-api';
import { EntityCard } from '@/modules/shared';
import { smartCardFields } from '../../lib/utils/btx-smart-card-fields';

interface SmartCardProps {
    item: SmartResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function SmartCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: SmartCardProps) {
    return (
        <EntityCard<SmartResponseDto>
            entity={item}
            title={(entity) => entity.name || `Smart #${entity.id}`}
            description={(entity) => entity.title || ''}
            fields={smartCardFields}
            onView={onViewDetails ? () => onViewDetails() : undefined}
            onEdit={onEdit ? () => onEdit() : undefined}
            onDelete={onDelete ? () => onDelete() : undefined}
            className="hover:shadow-md transition-shadow"
        />
    );
}
