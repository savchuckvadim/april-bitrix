'use client';

import type { AiOwnerReportTile } from '@/modules/entities/ai-analytics';

interface AiOwnerReportTilesProps {
    tiles: AiOwnerReportTile[];
}

/** Пять плиток шапки: число крупно, подпись, сравнение с прошлым периодом. */
export const AiOwnerReportTiles = ({ tiles }: AiOwnerReportTilesProps) => (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {tiles.map(tile => (
            <div
                key={tile.code}
                className="rounded-md border border-border/60 bg-background/40 p-3"
            >
                <div className="text-2xl font-semibold tabular-nums">{tile.value}</div>
                <div className="mt-1 text-xs leading-snug text-muted-foreground">
                    {tile.label}
                </div>
                {tile.compare && (
                    <div className="mt-1 text-[11px] text-muted-foreground/80">
                        {tile.compare}
                    </div>
                )}
            </div>
        ))}
    </div>
);
