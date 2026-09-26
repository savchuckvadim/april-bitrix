'use client';

import { Fingerprint, FolderOpen } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
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
import { formatAiSince } from '../../lib/ai-signal.util';
import { AiManagerName } from './AiManagerName';
import { AiLevelBadge } from './AiLevelBadge';
import { AiKeyMetricCell } from './AiKeyMetricCell';
import { AiBucketCell } from './AiBucketCell';
import { AiPlanCell } from './AiPlanCell';
import { AiDisagreeButton } from './AiDisagreeButton';
import { AiStyleTagChip } from './AiStyleTagChip';
import { AiSignalRiskCalls } from './AiSignalRiskCalls';
import { AiSignalLeversCell } from './AiSignalLeversCell';
import { AiTrendsCell } from './AiTrendsCell';
import { AiYoyBadge } from './AiYoyBadge';

interface AiSignalRowProps {
    row: AiManagerRow;
    /** Открыть карточку стиля менеджера. */
    onOpenStyle: (managerId: string) => void;
    /** Открыть досье менеджера (Фаза 3). */
    onOpenDossier: (managerId: string) => void;
}

/**
 * Строка таблицы сигналов: сотрудник + уровень + стаж + подписи стиля +
 * «Стиль» и «Досье» | сигнал + риск-звонки | ключевая цифра | корзины |
 * тренды | год назад | продажи | аванс | месячный чек | план CRM | рычаги |
 * «Не согласен».
 */
export const AiSignalRow = ({
    row,
    onOpenStyle,
    onOpenDossier,
}: AiSignalRowProps) => {
    const signal = row.signal ? AI_SIGNAL[row.signal.signal] : null;
    const styleTags = row.style?.tags ?? [];

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
                <div className="text-[0.6875rem] text-muted-foreground">
                    разобрано {row.analyzedCalls} из {row.callsTotal} ·{' '}
                    {formatAiSince(row.since, row.tenureMonths)}
                </div>
                {styleTags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {styleTags.map(tag => (
                            <AiStyleTagChip key={tag.code} tag={tag} />
                        ))}
                    </div>
                )}
                <div className="mt-1 flex flex-wrap gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-1 text-xs"
                        title="Карточка стиля менеджера"
                        onClick={() => onOpenStyle(row.managerId)}
                    >
                        <Fingerprint className="h-3 w-3" />
                        Стиль
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-1 text-xs"
                        title="Досье менеджера за окно месяцев"
                        onClick={() => onOpenDossier(row.managerId)}
                    >
                        <FolderOpen className="h-3 w-3" />
                        Досье
                    </Button>
                </div>
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
            <TableCell>
                <AiTrendsCell trends={row.trends} />
            </TableCell>
            <TableCell>
                <AiYoyBadge yoy={row.yoy} />
            </TableCell>
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
            <TableCell>
                <AiSignalLeversCell recommendations={row.recommendations} />
            </TableCell>
            <TableCell className="text-right">
                <AiDisagreeButton managerId={row.managerId} />
            </TableCell>
        </TableRow>
    );
};
