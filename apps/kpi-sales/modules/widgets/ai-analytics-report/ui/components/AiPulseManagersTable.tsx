'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    AiMetricValue,
    sortAiManagers,
    type AiPulseManager,
} from '@/modules/entities/ai-analytics';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';

interface AiPulseManagersTableProps {
    rows: AiPulseManager[];
}

/** Менеджеры окна с n ≥ 20: разобрано и доля «шаг с датой». */
export const AiPulseManagersTable = ({ rows }: AiPulseManagersTableProps) => {
    const managerName = useAiManagerName();

    if (!rows.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                Ни у кого из менеджеров нет 20 разобранных звонков за окно —
                построчных долей пока нет.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Менеджер</TableHead>
                    <TableHead className="text-right">Разобрано</TableHead>
                    <TableHead className="text-right">Шаг с датой</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortAiManagers(rows).map(row => (
                    <TableRow key={row.managerId}>
                        <TableCell>{managerName(row.managerId)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                            {row.analyzed}
                        </TableCell>
                        <TableCell className="text-right">
                            <AiMetricValue
                                metric={row.nextStepDateRate}
                                withDetails
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
