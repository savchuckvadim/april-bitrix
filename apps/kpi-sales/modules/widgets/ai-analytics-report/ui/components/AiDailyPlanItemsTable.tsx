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
import type { AiDailyPlanItem } from '@/modules/entities/ai-analytics';
import {
    formatAiPlanCap,
    sortAiDailyPlanItems,
} from '../../lib/ai-daily-plan.util';
import { AiPlanCell } from './AiPlanCell';

interface AiDailyPlanItemsTableProps {
    items: AiDailyPlanItem[];
}

/**
 * Строки плана по рёбрам воронки в порядке приоритета утечки: сегодня
 * (сделано / нужно с полосой), месяц (сделано / план) и потолок дневного
 * темпа полосы стажа.
 */
export const AiDailyPlanItemsTable = ({
    items,
}: AiDailyPlanItemsTableProps) => {
    if (!items.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                Строк плана нет: требуемый объём уже закрыт или разворачивать
                нечего.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Активность</TableHead>
                    <TableHead>Сегодня</TableHead>
                    <TableHead>Месяц</TableHead>
                    <TableHead className="text-right">
                        <HintTooltip
                            title="Потолок дня"
                            lines={[
                                'p90 дневного темпа полосы стажа: выше него план не ставится — догонять недобор за три дня не план, а демотивация.',
                            ]}
                        >
                            <span className="border-b border-dashed border-muted-foreground">
                                Потолок
                            </span>
                        </HintTooltip>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortAiDailyPlanItems(items).map(item => (
                    <TableRow key={item.callType}>
                        <TableCell className="text-xs text-muted-foreground">
                            {item.priority}
                        </TableCell>
                        <TableCell className="font-medium">
                            {item.title}
                        </TableCell>
                        <TableCell>
                            <AiPlanCell
                                done={item.doneToday}
                                plan={item.requiredToday}
                            />
                        </TableCell>
                        <TableCell>
                            <AiPlanCell
                                done={item.monthDone}
                                plan={item.monthPlan}
                            />
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                            {formatAiPlanCap(item.cap)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
