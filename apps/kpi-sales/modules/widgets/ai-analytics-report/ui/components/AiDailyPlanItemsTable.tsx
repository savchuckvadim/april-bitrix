'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { HintTooltip, LiquidProgress, ToneBadge } from '@workspace/april-ui';
import { aiPlanTone } from '@/modules/entities/ai-analytics';
import { AI_DAILY_PLAN_TOP_LEAK } from '../../lib/ai-daily-plan-activity.data';
import type { AiDailyPlanRowView } from '../../lib/ai-daily-plan-view.util';

interface AiDailyPlanItemsTableProps {
    /** Строки в порядке воронки (buildAiDailyPlanView). */
    rows: AiDailyPlanRowView[];
}

/** «За месяц»: сделано из плана с полосой; без плана — только сделано. */
const MonthCell = ({ row }: { row: AiDailyPlanRowView }) => (
    <div className="flex min-w-24 flex-col gap-1">
        <span className="text-sm tabular-nums">
            {row.monthDone}
            {row.monthPlan !== null && (
                <span className="text-muted-foreground">
                    {' '}
                    из {row.monthPlan}
                </span>
            )}
        </span>
        {row.monthShare !== null && (
            <LiquidProgress
                value={row.monthShare}
                tone={aiPlanTone(row.monthShare)}
                size="sm"
            />
        )}
    </div>
);

/**
 * Строки плана в порядке воронки: активность (вход ребра), сколько нужно
 * сегодня и сколько сделано за месяц из плана. Строку главной утечки
 * помечаем «узким местом».
 */
export const AiDailyPlanItemsTable = ({ rows }: AiDailyPlanItemsTableProps) => {
    if (!rows.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                Строк плана нет: разворачивать по воронке нечего.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Активность</TableHead>
                    <TableHead className="text-right">Нужно сегодня</TableHead>
                    <TableHead>За месяц</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map(row => (
                    <TableRow key={row.callType}>
                        <TableCell className="font-medium">
                            <div className="flex flex-wrap items-center gap-2">
                                <HintTooltip
                                    title={row.label}
                                    lines={[row.hint]}
                                >
                                    <span className="border-b border-dashed border-muted-foreground">
                                        {row.label}
                                    </span>
                                </HintTooltip>
                                {row.topLeak && (
                                    <ToneBadge
                                        tone="warning"
                                        variant="soft"
                                        size="sm"
                                        title={AI_DAILY_PLAN_TOP_LEAK.hint}
                                    >
                                        {AI_DAILY_PLAN_TOP_LEAK.label}
                                    </ToneBadge>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="text-right text-base font-semibold tabular-nums">
                            {row.today}
                        </TableCell>
                        <TableCell>
                            <MonthCell row={row} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
