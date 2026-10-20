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
import {
    AI_PULSE_MANAGER_MIN_N_FALLBACK,
    AI_PULSE_TEXT,
    AiMetricValue,
    aiMetricLowMax,
    sortAiManagers,
    type AiPulse,
} from '@/modules/entities/ai-analytics';
import { AiManagerName } from './AiManagerName';

interface AiPulseManagersTableProps {
    pulse: Pick<AiPulse, 'byManager' | 'window' | 'managerMinN'>;
    /** Порог длительности для подписи пустого состояния; null — не известен. */
    minDurationSec: number | null;
}

const T = AI_PULSE_TEXT.managers;

/**
 * Менеджеры окна с разборами не меньше порога портала (pulse.managerMinN;
 * старый кэш без поля — прежний гейт 20): разобрано и доля «шаг с датой»;
 * имя — ссылка на страницу сотрудника. Пустая таблица — окно датами,
 * порог строки и порог длительности.
 */
export const AiPulseManagersTable = ({
    pulse,
    minDurationSec,
}: AiPulseManagersTableProps) => {
    const managerMinN = pulse.managerMinN ?? AI_PULSE_MANAGER_MIN_N_FALLBACK;
    const rateHint = T.rateHint(managerMinN, aiMetricLowMax('rate'));

    if (!pulse.byManager.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                {T.empty(pulse.window.from, pulse.window.to, managerMinN, minDurationSec)}
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{T.columns.manager}</TableHead>
                    <TableHead className="text-right">{T.columns.analyzed}</TableHead>
                    <TableHead className="text-right">
                        <HintTooltip title={rateHint.title} lines={[...rateHint.lines]}>
                            <span className="cursor-help border-b border-dashed border-muted-foreground">
                                {T.columns.rate}
                            </span>
                        </HintTooltip>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortAiManagers(pulse.byManager).map(row => (
                    <TableRow key={row.managerId}>
                        <TableCell>
                            <AiManagerName managerId={row.managerId} />
                        </TableCell>
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
