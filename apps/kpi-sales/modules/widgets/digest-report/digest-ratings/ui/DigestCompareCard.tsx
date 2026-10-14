'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { SectionCard } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import {
    DIGEST_METRIC_BY_CODE,
    formatDigestAverage,
    formatDigestDelta,
    formatDigestMetric,
} from '@/modules/entities/digest';
import { deltaTone, type EmployeeComparison } from '../lib/ratings.util';

interface DigestCompareCardProps {
    comparison: EmployeeComparison;
}

const TONE_CLASS = {
    success: 'text-success',
    destructive: 'text-destructive',
    muted: 'text-muted-foreground',
} as const;

/** Сотрудник в фокусе против Ø отдела и Ø всех по ключевым метрикам. */
export const DigestCompareCard = ({ comparison }: DigestCompareCardProps) => (
    <SectionCard
        surface="glass"
        density="compact"
        title={`${comparison.row.name} — сравнение со средними`}
        description={
            comparison.deptName
                ? `Ø отдела «${comparison.deptName}» — по сотрудникам отдела в выборке; Ø все — по всем ответственным портала за день`
                : 'Ø все — по всем ответственным портала за день'
        }
    >
        <Table className="text-xs">
            <TableHeader>
                <TableRow>
                    <TableHead>Показатель</TableHead>
                    <TableHead className="text-right">Сотрудник</TableHead>
                    <TableHead className="text-right">Ø отдел</TableHead>
                    <TableHead className="text-right">Ø все</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {comparison.items.map(item => {
                    const def = DIGEST_METRIC_BY_CODE[item.code];
                    return (
                        <TableRow key={item.code}>
                            <TableCell>{def.label}</TableCell>
                            <TableCell className="text-right font-semibold tabular-nums">
                                {formatDigestMetric(item.value, def.kind)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatDigestAverage(item.dept, def.kind)}
                                <span
                                    className={cn(
                                        'ml-1',
                                        TONE_CLASS[deltaTone(item.code, item.deltaDeptPct)],
                                    )}
                                >
                                    {formatDigestDelta(item.deltaDeptPct)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatDigestAverage(item.all, def.kind)}
                                <span
                                    className={cn(
                                        'ml-1',
                                        TONE_CLASS[deltaTone(item.code, item.deltaAllPct)],
                                    )}
                                >
                                    {formatDigestDelta(item.deltaAllPct)}
                                </span>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    </SectionCard>
);
