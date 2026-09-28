'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import type { AiStyleAxis } from '@/modules/entities/ai-analytics';
import {
    aiStyleAxisHintLines,
    aiStyleAxisShare,
    aiStyleAxisSide,
    aiStyleCi80Band,
    aiStyleConfidence,
    aiStyleReasonLabel,
    formatAiStyleCi80,
    formatAiStyleDeviation,
} from '../../lib/ai-style.util';

interface AiStyleAxisRowProps {
    axis: AiStyleAxis;
}

const pct = (share: number): string => `${Math.round(share * 100)}%`;

/**
 * Ось стиля: полюса (ближний выделен), шкала с точкой значения и полосой
 * интервала 80 %, отклонение от коллег с интервалом, звонков, доверие и
 * его причина. У оси два законных полюса — цвет один, без «хорошо/плохо».
 */
export const AiStyleAxisRow = ({ axis }: AiStyleAxisRowProps) => {
    const side = aiStyleAxisSide(axis.value);
    const confidence = aiStyleConfidence(axis.confidence);
    const reason = aiStyleReasonLabel(axis.reason);
    const band = aiStyleCi80Band(axis.ci80);
    const ci = formatAiStyleCi80(axis.ci80);

    return (
        <TableRow>
            <TableCell className="font-medium">
                <HintTooltip
                    title={axis.title}
                    lines={aiStyleAxisHintLines(axis)}
                >
                    <span>{axis.title}</span>
                </HintTooltip>
            </TableCell>
            <TableCell
                className={cn(
                    'text-right text-xs',
                    side === 'minus'
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground',
                )}
            >
                {axis.minus}
            </TableCell>
            <TableCell className="min-w-40">
                <div
                    className="relative h-2 w-full rounded-full bg-muted"
                    aria-hidden
                >
                    <span className="absolute inset-y-0 left-1/2 w-px bg-muted-foreground/40" />
                    {band && (
                        <span
                            className="absolute inset-y-0 rounded-full bg-primary/20"
                            style={{
                                left: pct(band.left),
                                width: pct(band.width),
                            }}
                        />
                    )}
                    <span
                        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
                        style={{ left: pct(aiStyleAxisShare(axis.value)) }}
                    />
                </div>
            </TableCell>
            <TableCell
                className={cn(
                    'text-xs',
                    side === 'plus'
                        ? 'font-semibold text-foreground'
                        : 'text-muted-foreground',
                )}
            >
                {axis.plus}
            </TableCell>
            <TableCell className="text-right text-xs tabular-nums">
                {formatAiStyleDeviation(axis.value)}
                {ci && (
                    <div className="text-[0.6875rem] text-muted-foreground">
                        {ci}
                    </div>
                )}
            </TableCell>
            <TableCell className="text-right text-xs tabular-nums">
                {axis.n}
            </TableCell>
            <TableCell>
                <ToneBadge tone={confidence.tone} variant="soft" size="sm">
                    {confidence.label}
                </ToneBadge>
                {reason && (
                    <div className="text-[0.6875rem] text-muted-foreground">
                        {reason}
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
};
