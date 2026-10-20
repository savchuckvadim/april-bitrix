'use client';

import { CardContent } from '@workspace/ui/components/card';
import { GlassCard, HintTooltip, ToneBadge } from '@workspace/april-ui';
import type { AiEmployeeTile as AiEmployeeTileModel } from '../../lib/ai-employee-brief.util';

interface AiEmployeeTileProps {
    tile: AiEmployeeTileModel;
}

/** Плитка «Коротко»: подпись с подсказкой «что это и что сделать», значение, подстрока. */
export const AiEmployeeTile = ({ tile }: AiEmployeeTileProps) => (
    <GlassCard intensity="strong" className="bg-popover">
        <CardContent className="space-y-1 p-3">
            <HintTooltip title={tile.hint.title} lines={[...tile.hint.lines]}>
                <p className="w-fit cursor-help border-b border-dashed border-muted-foreground/60 text-xs text-muted-foreground">
                    {tile.label}
                </p>
            </HintTooltip>
            <div className="flex flex-wrap items-center gap-2">
                <ToneBadge tone={tile.tone} variant="soft" size="sm">
                    {tile.value}
                </ToneBadge>
            </div>
            {tile.note && (
                <p className="text-xs text-muted-foreground">{tile.note}</p>
            )}
        </CardContent>
    </GlassCard>
);
