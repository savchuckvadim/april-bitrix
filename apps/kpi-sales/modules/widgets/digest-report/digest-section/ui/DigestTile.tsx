'use client';

import { CardContent } from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import { GlassCard } from '@workspace/april-ui';
import type { DigestTileData } from '../../lib/digest-tile';

interface DigestTileProps {
    tile: DigestTileData;
}

/** Плитка итога: подпись, значение, пояснение (общая для виджетов дайджеста). */
export const DigestTile = ({ tile }: DigestTileProps) => (
    <GlassCard intensity="strong" className="bg-popover">
        <CardContent className="p-3">
            <p className={cn('text-xs', tile.accent)}>{tile.label}</p>
            <div className="mt-1 text-lg font-bold leading-tight">{tile.value}</div>
            {tile.sub && (
                <p className="mt-1 text-[0.6875rem] leading-snug text-muted-foreground">
                    {tile.sub}
                </p>
            )}
        </CardContent>
    </GlassCard>
);
