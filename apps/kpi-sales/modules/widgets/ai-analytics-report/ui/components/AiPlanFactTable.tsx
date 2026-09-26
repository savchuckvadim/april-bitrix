'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_PLAN_FACT_INDICATOR,
    AI_PLAN_FACT_STATUS,
    aiPlanFactReasonLabel,
    formatAiPlanFactGap,
    formatAiPlanFactPace,
    formatAiPlanFactPerDay,
    formatAiPlanFactValue,
    sortAiPlanFactRows,
    type AiPlanFactRow,
} from '@/modules/entities/ai-analytics';

/** Группа строк таблицы: подпись (отдел или менеджер) и строки по показателям. */
export interface AiPlanFactGroup {
    key: string;
    title: string;
    rows: AiPlanFactRow[];
}

interface AiPlanFactTableProps {
    groups: AiPlanFactGroup[];
    /** Без заголовков групп — таблица одного менеджера (досье). */
    flat?: boolean;
}

const HEADERS = [
    'Показатель',
    'План',
    'Факт',
    'Темп',
    'Прогноз P50',
    'Разрыв',
    'В день надо',
    'Статус',
] as const;

/** Строка показателя: план, факт, темп, прогноз, разрыв, «в день надо», статус с причинами. */
const AiPlanFactRowView = ({ row }: { row: AiPlanFactRow }) => {
    const status = AI_PLAN_FACT_STATUS[row.status];
    const badge = (
        <span>
            <ToneBadge tone={status.tone} variant="soft" size="sm">
                {status.label}
            </ToneBadge>
        </span>
    );
    return (
        <TableRow>
            <TableCell>
                {AI_PLAN_FACT_INDICATOR[row.indicator].label}
                <span className="ml-1 text-xs text-muted-foreground">
                    {AI_PLAN_FACT_INDICATOR[row.indicator].unit}
                </span>
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {formatAiPlanFactValue(row.plan)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {formatAiPlanFactValue(row.fact)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {formatAiPlanFactPace(row.pace)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {formatAiPlanFactValue(row.forecastP50)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {formatAiPlanFactGap(row.gap)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {formatAiPlanFactPerDay(row.perDayNeeded)}
            </TableCell>
            <TableCell>
                {row.reasons.length ? (
                    <HintTooltip
                        title="Почему так"
                        lines={row.reasons.map(aiPlanFactReasonLabel)}
                    >
                        {badge}
                    </HintTooltip>
                ) : (
                    badge
                )}
            </TableCell>
        </TableRow>
    );
};

/**
 * Таблица реконсиляции: группы (отдел, менеджеры) → строки по показателям
 * в порядке справочника. Числа приходят с бэка как есть; null — прочерк.
 */
export const AiPlanFactTable = ({ groups, flat = false }: AiPlanFactTableProps) => (
    <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    {HEADERS.map((header, index) => (
                        <TableHead
                            key={header}
                            className={
                                index > 0 && index < HEADERS.length - 1
                                    ? 'text-right'
                                    : undefined
                            }
                        >
                            {header}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {groups.map(group => (
                    <GroupRows key={group.key} group={group} flat={flat} />
                ))}
            </TableBody>
        </Table>
    </div>
);

const GroupRows = ({ group, flat }: { group: AiPlanFactGroup; flat: boolean }) => (
    <>
        {!flat && (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableCell
                    colSpan={HEADERS.length}
                    className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                    {group.title}
                </TableCell>
            </TableRow>
        )}
        {sortAiPlanFactRows(group.rows).map(row => (
            <AiPlanFactRowView key={`${group.key}-${row.indicator}`} row={row} />
        ))}
    </>
);
