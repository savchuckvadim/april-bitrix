'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_BUCKETS,
    AI_SIGNAL,
    aiAttentionHintLines,
    aiBucketScore,
    formatAiCount,
    formatAiMoneyCompact,
    type AiManagerRow,
} from '@/modules/entities/ai-analytics';
import { AiManagerName } from './AiManagerName';
import { AiLevelBadge } from './AiLevelBadge';
import { AiKeyMetricCell } from './AiKeyMetricCell';
import { AiBucketCell } from './AiBucketCell';
import { AiPlanCell } from './AiPlanCell';
import { AiDisagreeButton } from './AiDisagreeButton';

interface AiSignalRowProps {
    row: AiManagerRow;
}

/**
 * Строка таблицы сигналов: сотрудник + уровень | сигнал | ключевая цифра |
 * корзины | продажи | аванс | месячный чек | план CRM | «Не согласен».
 */
export const AiSignalRow = ({ row }: AiSignalRowProps) => {
    const signal = row.signal ? AI_SIGNAL[row.signal.signal] : null;

    return (
        <TableRow>
            <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                    <AiManagerName managerId={row.managerId} />
                    <AiLevelBadge
                        level={row.level}
                        source={row.levelSource}
                        tenureMonths={row.tenureMonths}
                        funnelShape={row.funnelShape}
                    />
                </div>
                <span className="text-[0.6875rem] text-muted-foreground">
                    разобрано {row.analyzedCalls} из {row.callsTotal}
                </span>
            </TableCell>
            <TableCell>
                {signal && row.signal ? (
                    <HintTooltip
                        title={row.signal.headline}
                        lines={aiAttentionHintLines(row.signal)}
                    >
                        <span>
                            <ToneBadge
                                tone={signal.tone}
                                variant="soft"
                                size="sm"
                            >
                                {signal.label}
                            </ToneBadge>
                        </span>
                    </HintTooltip>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </TableCell>
            <TableCell>
                <AiKeyMetricCell metric={row.keyMetric} />
            </TableCell>
            {AI_BUCKETS.map(bucket => (
                <TableCell key={bucket} className="text-right">
                    <AiBucketCell bucket={aiBucketScore(row, bucket)} />
                </TableCell>
            ))}
            <TableCell className="text-right tabular-nums">
                {formatAiCount(row.finance.salesCount)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {formatAiMoneyCompact(row.finance.advanceAmount)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {formatAiMoneyCompact(row.finance.monthlyAmount)}
            </TableCell>
            <TableCell>
                <AiPlanCell
                    done={row.discipline.callDone}
                    plan={row.discipline.callPlan}
                />
            </TableCell>
            <TableCell>
                <AiPlanCell
                    done={row.discipline.presentationDone}
                    plan={row.discipline.presentationPlan}
                />
            </TableCell>
            <TableCell className="text-right">
                <AiDisagreeButton managerId={row.managerId} />
            </TableCell>
        </TableRow>
    );
};
