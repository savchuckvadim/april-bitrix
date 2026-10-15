'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { HintTooltip } from '@workspace/april-ui';
import type { EnabledPlanIndicator } from '@/modules/feature/plans';
import type { DigestPlanCell as DigestPlanCellValue, DigestPlanRow } from '../../lib/digest-plan-fact.util';
import { DigestPlanCell } from './DigestPlanCell';

interface DigestPlanTableProps {
    indicators: EnabledPlanIndicator[];
    rows: DigestPlanRow[];
    totals: DigestPlanCellValue[] | null;
    expected: number;
}

const HEAD_HINT = [
    'Факт дня / план руководителя на день (цель периода, приведённая к одному дню) и % выполнения.',
    'Ниже — сколько событий этого вида было запланировано в CRM на день и какая доля из них состоялась (конверсия плана).',
];

/** Таблица «план CRM → план руководителя → факт» по сотрудникам и показателям. */
export const DigestPlanTable = ({ indicators, rows, totals, expected }: DigestPlanTableProps) => (
    <div className="overflow-x-auto">
        <Table className="text-sm">
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[190px]">Сотрудник</TableHead>
                    {indicators.map(indicator => (
                        <TableHead key={indicator.code}>
                            <HintTooltip title={indicator.displayName} lines={HEAD_HINT}>
                                <span className="cursor-help">{indicator.displayName}</span>
                            </HintTooltip>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map(row => (
                    <TableRow key={row.userId}>
                        <TableCell className="font-medium">{row.userName}</TableCell>
                        {row.cells.map((cell, index) => (
                            <TableCell key={cell.code}>
                                <DigestPlanCell
                                    cell={cell}
                                    unit={indicators[index]!.unit}
                                    expected={expected}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
                {totals && (
                    <TableRow className="border-t-2">
                        <TableCell className="font-semibold">Итого</TableCell>
                        {totals.map((cell, index) => (
                            <TableCell key={cell.code}>
                                <DigestPlanCell
                                    cell={cell}
                                    unit={indicators[index]!.unit}
                                    expected={expected}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);
