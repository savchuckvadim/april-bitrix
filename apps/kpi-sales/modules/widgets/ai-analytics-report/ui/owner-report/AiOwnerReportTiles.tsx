'use client';

import { TONE_BORDER, TONE_TEXT } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import type { AiOwnerReportTile } from '@/modules/entities/ai-analytics';
import { AI_OWNER_REPORT_TONE } from '../../lib/ai-owner-report-tone';

interface AiOwnerReportTilesProps {
    tiles: AiOwnerReportTile[];
}

/**
 * Пять плиток шапки: число крупно, подпись, сравнение с прошлым периодом.
 * Цвет кромки и числа — по оценке доли с сервера (хорошо / внимание / плохо).
 */
export const AiOwnerReportTiles = ({ tiles }: AiOwnerReportTilesProps) => (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {tiles.map(tile => {
            const tone = AI_OWNER_REPORT_TONE[tile.tone] ?? 'neutral';
            return (
                <div
                    key={tile.code}
                    className={cn(
                        'rounded-md border border-t-4 bg-background/40 p-3',
                        TONE_BORDER[tone],
                    )}
                >
                    <div
                        className={cn(
                            'text-2xl font-semibold tabular-nums',
                            TONE_TEXT[tone],
                        )}
                    >
                        {tile.value}
                    </div>
                    <div className="mt-1 text-xs leading-snug text-foreground/80">
                        {tile.label}
                    </div>
                    {tile.compare && (
                        <div className="mt-1 text-[11px] text-muted-foreground">
                            {tile.compare}
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);
