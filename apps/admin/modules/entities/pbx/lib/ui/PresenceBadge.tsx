'use client';

import { Badge } from '@workspace/ui/components/badge';

/** Compact "есть / нет" indicator used in the three-source compare tables. */
export function PresenceBadge({ present }: { present: boolean }) {
    return present ? (
        <Badge variant="default">есть</Badge>
    ) : (
        <Badge variant="outline" className="text-muted-foreground">
            нет
        </Badge>
    );
}
