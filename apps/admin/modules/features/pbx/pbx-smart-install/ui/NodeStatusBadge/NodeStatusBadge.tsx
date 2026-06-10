'use client';

import { Badge } from '@workspace/ui/components/badge';
import type { PbxNodeStatus } from '../../model/types';

interface NodeStatusBadgeProps {
    status: PbxNodeStatus;
    className?: string;
}

const CONFIG: Record<
    PbxNodeStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
    installed: { label: 'Установлен', variant: 'default' },
    partial: { label: 'Частично', variant: 'secondary' },
    missing: { label: 'Не установлен', variant: 'destructive' },
    mapped: { label: 'Сопоставлен', variant: 'outline' },
};

export function NodeStatusBadge({ status, className }: NodeStatusBadgeProps) {
    const { label, variant } = CONFIG[status];
    return (
        <Badge variant={variant} className={className}>
            {label}
        </Badge>
    );
}
