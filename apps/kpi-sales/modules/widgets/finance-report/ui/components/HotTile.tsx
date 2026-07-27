import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';

interface HotTileProps {
    label: string;
    value: string;
    /** Акцент подписи — финансовый токен (например text-finance-advance). */
    accent?: string;
}

/** Плитка сводки горячих клиентов (подпись + значение). */
export const HotTile: React.FC<HotTileProps> = ({ label, value, accent }) => (
    <Card className="bg-popover">
        <CardContent className="p-4">
            <p className={cn('text-xs text-muted-foreground', accent)}>
                {label}
            </p>
            <div className="mt-1 text-xl font-bold">{value}</div>
        </CardContent>
    </Card>
);
