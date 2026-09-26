'use client';

import type { ReactElement } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import { cn } from '@workspace/ui/lib/utils';
import {
    aiPlanFactIndicatorLabel,
    aiPlanFactReasonLabel,
    aiPlanFactRowHasPlan,
    aiPlanFactRowStatusView,
    formatAiPlanFactGap,
    formatAiPlanFactPace,
    formatAiPlanFactPerDay,
    formatAiPlanFactValue,
    sortAiPlanFactRows,
    type AiPlanFactRow,
} from '@/modules/entities/ai-analytics';
import {
    AI_PLAN_FACT_COLUMNS,
    AI_PLAN_FACT_FACT_ONLY_COLUMNS,
    AI_PLAN_FACT_NO_PLAN_CELL,
    AI_PLAN_FACT_PLAN_SPAN,
    resolveAiPlanFactTableMode,
    type AiPlanFactColumn,
    type AiPlanFactGroup,
} from '../../lib/ai-plan-fact-view.util';

export type { AiPlanFactGroup } from '../../lib/ai-plan-fact-view.util';

interface AiPlanFactTableProps {
    groups: AiPlanFactGroup[];
    /** Без заголовков групп — таблица одного менеджера (досье). */
    flat?: boolean;
    /**
     * Только факт: колонки «Показатель | Факт». Не передан — сам, когда ни
     * у одной строки нет цели (например, досье менеджера без плана), и тогда
     * над таблицей короткая подпись, почему плана нет.
     */
    factOnly?: boolean;
}

const NUM = 'text-right tabular-nums';
const HINT_TRIGGER =
    'cursor-help border-b border-dashed border-muted-foreground';

/** Заголовок колонки; с подсказкой — пунктир и тултип «что это». */
const ColumnHead = ({ column }: { column: AiPlanFactColumn }) => (
    <TableHead className={column.numeric ? 'text-right' : undefined}>
        {column.hint ? (
            <HintTooltip title={column.label} lines={[column.hint]}>
                <span className={HINT_TRIGGER}>{column.label}</span>
            </HintTooltip>
        ) : (
            column.label
        )}
    </TableHead>
);

/** Подсказка «почему так» по кодам строки; без причин — как есть. */
const WithReasons = ({
    reasons,
    children,
}: {
    reasons: readonly string[];
    children: ReactElement;
}) =>
    reasons.length ? (
        <HintTooltip
            title="Почему так"
            lines={reasons.map(aiPlanFactReasonLabel)}
        >
            {children}
        </HintTooltip>
    ) : (
        children
    );

/** Колонки от «План» до «Статус» у строки с целью. */
const PlanCells = ({ row }: { row: AiPlanFactRow }) => {
    const status = aiPlanFactRowStatusView(row);
    return (
        <>
            <TableCell className={NUM}>
                {formatAiPlanFactValue(row.plan)}
            </TableCell>
            <TableCell className={NUM}>
                {formatAiPlanFactPace(row.pace)}
            </TableCell>
            <TableCell className={NUM}>
                {formatAiPlanFactValue(row.forecastP50)}
            </TableCell>
            <TableCell className={NUM}>
                {formatAiPlanFactGap(row.gap)}
            </TableCell>
            <TableCell className={NUM}>
                {formatAiPlanFactPerDay(row.perDayNeeded)}
            </TableCell>
            <TableCell>
                <WithReasons reasons={row.reasons}>
                    <span>
                        <ToneBadge tone={status.tone} variant="soft" size="sm">
                            {status.label}
                        </ToneBadge>
                    </span>
                </WithReasons>
            </TableCell>
        </>
    );
};

/** Строка показателя: подпись с единицей, факт и (если нужно) колонки плана. */
const AiPlanFactRowView = ({
    row,
    factOnly,
}: {
    row: AiPlanFactRow;
    factOnly: boolean;
}) => (
    <TableRow>
        <TableCell>{aiPlanFactIndicatorLabel(row.indicator)}</TableCell>
        <TableCell className={NUM}>{formatAiPlanFactValue(row.fact)}</TableCell>
        {factOnly ? null : aiPlanFactRowHasPlan(row) ? (
            <PlanCells row={row} />
        ) : (
            <TableCell
                colSpan={AI_PLAN_FACT_PLAN_SPAN}
                className="text-xs text-muted-foreground"
            >
                <WithReasons reasons={row.reasons}>
                    <span
                        className={
                            row.reasons.length ? HINT_TRIGGER : undefined
                        }
                    >
                        {AI_PLAN_FACT_NO_PLAN_CELL}
                    </span>
                </WithReasons>
            </TableCell>
        )}
    </TableRow>
);

/** Подпись группы (отдел или менеджер) и её строки в порядке справочника. */
const GroupRows = ({
    group,
    flat,
    factOnly,
    colSpan,
}: {
    group: AiPlanFactGroup;
    flat: boolean;
    factOnly: boolean;
    colSpan: number;
}) => (
    <>
        {!flat && (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableCell
                    colSpan={colSpan}
                    className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                    {group.title}
                </TableCell>
            </TableRow>
        )}
        {sortAiPlanFactRows(group.rows).map(row => (
            <AiPlanFactRowView
                key={`${group.key}-${row.indicator}`}
                row={row}
                factOnly={factOnly}
            />
        ))}
    </>
);

/**
 * Таблица реконсиляции: группы (отдел, менеджеры) → строки по показателям
 * в порядке справочника. Факт — сразу за показателем; у строки без цели
 * колонки плана схлопнуты в одну ячейку «плана нет». Режим «только факт» —
 * компактные «Показатель | Факт». Числа с бэка как есть; null — прочерк.
 */
export const AiPlanFactTable = ({
    groups,
    flat = false,
    factOnly: factOnlyProp,
}: AiPlanFactTableProps) => {
    const { factOnly, caption } = resolveAiPlanFactTableMode(
        groups,
        factOnlyProp,
    );
    const columns = factOnly
        ? AI_PLAN_FACT_FACT_ONLY_COLUMNS
        : AI_PLAN_FACT_COLUMNS;
    return (
        <div className={cn('overflow-x-auto', factOnly && 'max-w-md')}>
            {caption && (
                <p className="mb-1 text-xs text-muted-foreground">{caption}</p>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map(column => (
                            <ColumnHead key={column.key} column={column} />
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {groups.map(group => (
                        <GroupRows
                            key={group.key}
                            group={group}
                            flat={flat}
                            factOnly={factOnly}
                            colSpan={columns.length}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
