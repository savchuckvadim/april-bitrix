'use client';

import * as React from 'react';
import { GetComplectResponseDto } from '@workspace/nest-admin-api';
import { EntityCard } from '@/modules/shared';
import { complectCardFields } from '../../lib/utils';
import { Button } from '@workspace/ui/components';

interface ComplectCardProps {
    item: GetComplectResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}


export function ComplectCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
}: ComplectCardProps) {
    return (
        <div>
        
            <EntityCard<GetComplectResponseDto>
                entity={item}
                title="Complect"
                fields={complectCardFields}
                description={item.description}
                // onEdit={onEdit}
                // onDelete={onDelete}
                // onView={onViewDetails}
                className="hover:shadow-md transition-shadow"
            />
        </div>


    );
}
