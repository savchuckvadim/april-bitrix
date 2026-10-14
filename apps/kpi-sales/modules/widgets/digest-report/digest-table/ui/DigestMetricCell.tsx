'use client';

import { TableCell } from '@workspace/ui/components/table';
import { HintTooltip } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import {
    DIGEST_METRIC_BY_CODE,
    formatDigestMetric,
    type DigestMetricCode,
} from '@/modules/entities/digest';

interface DigestMetricCellProps {
    code: DigestMetricCode;
    value: number | null;
    /** Строки разбивки по типам/причинам — тултип при наведении. */
    lines?: string[];
    muted?: boolean;
    bold?: boolean;
}

/** Значение метрики с разбивкой в подсказке. */
export const DigestMetricCell = ({ code, value, lines, muted, bold }: DigestMetricCellProps) => {
    const def = DIGEST_METRIC_BY_CODE[code];
    const text = formatDigestMetric(value, def.kind);
    const hasLines = !!lines?.length;
    const content = (
        <span
            className={cn(
                'tabular-nums',
                muted && 'text-muted-foreground',
                bold && 'font-semibold',
                hasLines && 'cursor-help underline decoration-dotted underline-offset-2',
            )}
        >
            {text}
        </span>
    );
    return (
        <TableCell className="text-right">
            {hasLines ? (
                <HintTooltip title={def.label} lines={lines}>
                    {content}
                </HintTooltip>
            ) : (
                content
            )}
        </TableCell>
    );
};
