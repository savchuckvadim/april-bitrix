'use client';

import { Badge } from '@workspace/ui/components/badge';

export interface RqFillBadgeProps {
    percent: number;
}

/** Заполненность блока реквизита: ниже 20 — плохо, выше 75 — хорошо. */
export const RqFillBadge = ({ percent }: RqFillBadgeProps) => (
    <Badge
        variant="outline"
        className={
            percent > 75
                ? 'border-success/40 text-success'
                : percent > 20
                  ? 'border-warning/40 text-warning'
                  : 'border-destructive/40 text-destructive'
        }
    >
        Заполнено {percent}%
    </Badge>
);
