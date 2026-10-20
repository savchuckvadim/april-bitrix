'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { HintTooltip, ToneBadge } from '@workspace/april-ui';
import {
    AI_BUCKETS,
    aiAttentionHintLines,
    aiBucketScore,
    aiSignalView,
    type AiManagerRow,
} from '@/modules/entities/ai-analytics';
import type { AiSignalColumns } from '../../lib/ai-signal.util';
import type { AiSignalRowContext } from '../../hooks/use-ai-signal-row-context';
import { AiKeyMetricCell } from './AiKeyMetricCell';
import { AiBucketCell } from './AiBucketCell';
import { AiPlanCell } from './AiPlanCell';
import { AiDisagreeButton } from './AiDisagreeButton';
import { AiSignalRiskCalls } from './AiSignalRiskCalls';
import { AiSignalLeversCell } from './AiSignalLeversCell';
import { AiTrendsCell } from './AiTrendsCell';
import { AiYoyBadge } from './AiYoyBadge';
import { AiSignalManagerCell } from './AiSignalManagerCell';
import { AiFinanceCells } from './AiFinanceCells';
import { AiPlanHeadCell } from './AiPlanHeadCell';

interface AiSignalRowProps {
    row: AiManagerRow;
    /** Видимые колонки «Тренды» / «Год назад» / «План руководителя». */
    columns: AiSignalColumns;
    /** Общий для строк контекст: статус разбора, период, ожидаемая доля плана. */
    context: AiSignalRowContext;
    /** Открыть карточку стиля менеджера. */
    onOpenStyle: (managerId: string) => void;
    /** Открыть досье менеджера (Фаза 3). */
    onOpenDossier: (managerId: string) => void;
}

/**
 * Строка таблицы сигналов: сотрудник (уровень, «разобрано N из M», стаж,
 * стиль, «Стиль» и «Досье») | сигнал + риск-звонки | ключевая цифра |
 * корзины | тренды | год назад (если колонки видны) | сделок | аванс
 * (в кассе) | месячная сумма | звонки и презентации «сделано / в CRM» |
 * план руководителя (если есть) | советы | «Не согласен».
 */
export const AiSignalRow = ({
    row,
    columns,
    context,
    onOpenStyle,
    onOpenDossier,
}: AiSignalRowProps) => {
    // Сигнал из старого кэша, которого нет в словаре, — запасная подпись.
    const signal = row.signal ? aiSignalView(row.signal.signal) : null;

    return (
        <TableRow>
            <TableCell>
                <AiSignalManagerCell
                    row={row}
                    analyzedCtx={context.analyzed}
                    onOpenStyle={onOpenStyle}
                    onOpenDossier={onOpenDossier}
                />
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
                <AiSignalRiskCalls calls={row.riskCalls} />
            </TableCell>
            <TableCell>
                <AiKeyMetricCell metric={row.keyMetric} />
            </TableCell>
            {AI_BUCKETS.map(bucket => (
                <TableCell key={bucket} className="text-right">
                    <AiBucketCell bucket={aiBucketScore(row, bucket)} />
                </TableCell>
            ))}
            {columns.trends && (
                <TableCell>
                    <AiTrendsCell trends={row.trends} />
                </TableCell>
            )}
            {columns.yoy && (
                <TableCell>
                    <AiYoyBadge yoy={row.yoy} />
                </TableCell>
            )}
            <AiFinanceCells finance={row.finance} />
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
            {columns.planHead && (
                <TableCell>
                    <AiPlanHeadCell
                        targets={row.planTargets}
                        expected={context.planExpected}
                    />
                </TableCell>
            )}
            <TableCell>
                <AiSignalLeversCell
                    managerId={row.managerId}
                    recommendations={row.recommendations}
                />
            </TableCell>
            <TableCell className="text-right">
                <AiDisagreeButton managerId={row.managerId} />
            </TableCell>
        </TableRow>
    );
};
