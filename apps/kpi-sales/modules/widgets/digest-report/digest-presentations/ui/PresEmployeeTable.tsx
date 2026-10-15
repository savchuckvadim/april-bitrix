'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { formatDigestNumber, formatDigestPercent } from '@/modules/entities/digest';
import { formatPresValue, type PresEmployeeRow } from '../lib/presentations-view.util';

interface PresEmployeeTableProps {
    rows: PresEmployeeRow[];
}

const n = formatDigestNumber;
const HEADERS = [
    'План рук.',
    'В CRM на день',
    'Проведено',
    '% плана рук.',
    'Конв. плана CRM',
    'Не сост.',
    'Перенос',
    'Отказ',
    'Ждут',
    'Новые планы',
    'Спонт.',
];

/** Презентации по сотрудникам: план руководителя → план CRM → факт, исходы, комплекты. */
export const PresEmployeeTable = ({ rows }: PresEmployeeTableProps) => {
    if (!rows.length) {
        return <p className="py-3 text-sm text-muted-foreground">Нет презентаций по выборке</p>;
    }
    return (
        <div className="overflow-x-auto">
            <Table className="text-sm">
                <TableHeader>
                    <TableRow>
                        <TableHead>Сотрудник</TableHead>
                        {HEADERS.map(header => (
                            <TableHead key={header} className="whitespace-nowrap text-right text-xs">
                                {header}
                            </TableHead>
                        ))}
                        <TableHead className="text-xs">Комплекты</TableHead>
                        <TableHead className="text-right text-xs">Сумма</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.userId}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell className="text-right tabular-nums">
                                {row.managerPlan === null ? '—' : n(row.managerPlan)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{n(row.summary.plannedAtStart)}</TableCell>
                            <TableCell className="text-right font-semibold tabular-nums">{n(row.summary.held)}</TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatDigestPercent(row.planExecution)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatDigestPercent(row.summary.planConversion)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{n(row.summary.notHeld)}</TableCell>
                            <TableCell className="text-right tabular-nums">{n(row.summary.postponed)}</TableCell>
                            <TableCell className="text-right tabular-nums">{n(row.summary.refused)}</TableCell>
                            <TableCell className="text-right tabular-nums">{n(row.summary.pending)}</TableCell>
                            <TableCell className="text-right tabular-nums">{n(row.summary.plannedNext)}</TableCell>
                            <TableCell className="text-right tabular-nums">{n(row.summary.spontaneous)}</TableCell>
                            <TableCell className="max-w-56 truncate text-xs text-muted-foreground" title={row.complects.join(', ')}>
                                {row.complects.join(', ') || '—'}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {row.summary.heldSum ? formatPresValue(row.summary.heldSum, 'money') : '—'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
