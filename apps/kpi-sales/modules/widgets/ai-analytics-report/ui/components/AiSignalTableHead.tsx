'use client';

import { TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import { HintTooltip } from '@workspace/april-ui';
import { AI_BUCKETS, type AiFinanceSource } from '@/modules/entities/ai-analytics';
import {
    AI_SIGNAL_COLUMN,
    AI_SIGNAL_FINANCE_GROUP,
    type AiSignalColumnKey,
} from '../../lib/ai-signal-columns.texts';
import {
    AI_SIGNAL_FINANCE_COLUMNS,
    aiSignalColumnsBeforeFinance,
    type AiSignalColumns,
} from '../../lib/ai-signal.util';

interface AiSignalTableHeadProps {
    columns: AiSignalColumns;
    /** Период закрытых продаж строк (finance.source); старый кэш — null. */
    financeSource: AiFinanceSource | null;
}

const HINT_TRIGGER = 'cursor-help border-b border-dashed border-muted-foreground';

/** Заголовок колонки с подсказкой «что это и как читать». */
const Head = ({
    column,
    className,
}: {
    column: AiSignalColumnKey;
    className?: string;
}) => {
    const text = AI_SIGNAL_COLUMN[column];
    return (
        <TableHead className={className}>
            <HintTooltip title={text.hint.title} lines={[...text.hint.lines]}>
                <span className={HINT_TRIGGER}>{text.label}</span>
            </HintTooltip>
        </TableHead>
    );
};

/** Число колонок после финансовых: 2 колонки CRM, план руководителя, советы, «Не согласен». */
const columnsAfterFinance = (columns: AiSignalColumns): number =>
    4 + Number(columns.planHead);

/**
 * Шапка таблицы сигналов: строка-группа над финансовыми колонками (период
 * как на вкладке «Финансы» с подсказкой) и строка колонок — у каждой
 * подпись и подсказка из словаря.
 */
export const AiSignalTableHead = ({
    columns,
    financeSource,
}: AiSignalTableHeadProps) => {
    const group = AI_SIGNAL_FINANCE_GROUP;
    const groupLabel = financeSource
        ? group.label(financeSource.from, financeSource.to)
        : group.labelNoSource;
    const groupHint = group.hint(
        financeSource?.from ?? null,
        financeSource?.to ?? null,
    );

    return (
        <TableHeader>
            <TableRow className="border-b-0 hover:bg-transparent">
                <TableHead colSpan={aiSignalColumnsBeforeFinance(columns)} />
                <TableHead
                    colSpan={AI_SIGNAL_FINANCE_COLUMNS}
                    className="h-7 text-center text-[0.6875rem] font-normal normal-case text-muted-foreground"
                >
                    <HintTooltip title={groupHint.title} lines={[...groupHint.lines]}>
                        <span className={HINT_TRIGGER}>{groupLabel}</span>
                    </HintTooltip>
                </TableHead>
                <TableHead colSpan={columnsAfterFinance(columns)} />
            </TableRow>
            <TableRow>
                <Head column="manager" className="min-w-52" />
                <Head column="signal" />
                <Head column="keyMetric" className="min-w-40" />
                {AI_BUCKETS.map(bucket => (
                    <Head key={bucket} column={bucket} className="text-right" />
                ))}
                {columns.trends && <Head column="trends" />}
                {columns.yoy && <Head column="yoy" />}
                <Head column="sales" className="text-right" />
                <Head column="advance" className="text-right" />
                <Head column="monthly" className="text-right" />
                <Head column="callsCrm" />
                <Head column="presentationsCrm" />
                {columns.planHead && (
                    <Head column="planHead" className={cn('min-w-44')} />
                )}
                <Head column="levers" className="min-w-44" />
                <TableHead />
            </TableRow>
        </TableHeader>
    );
};
