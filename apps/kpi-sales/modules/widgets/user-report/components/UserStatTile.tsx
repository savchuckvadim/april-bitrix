import React from 'react';
import { CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import { GlassCard } from '@workspace/april-ui/src';

interface UserStatTileProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    /** Акцент подписи — токен цвета (например text-finance-monthly). */
    accent: string;
}

/** Компактная плитка статистики менеджера (подпись + число). */
export const UserStatTile: React.FC<UserStatTileProps> = ({
    label,
    value,
    icon,
    accent,
}) => (
    <GlassCard intensity='strong' className="bg-popover">
        <CardContent className="p-3">
            <p className={cn('flex items-center gap-1 text-xs', accent)}>
                {icon}
                {label}
            </p>
            <div className="mt-1 text-lg font-bold">
                {value.toLocaleString('ru-RU')}
            </div>
        </CardContent>
    </GlassCard>
);
