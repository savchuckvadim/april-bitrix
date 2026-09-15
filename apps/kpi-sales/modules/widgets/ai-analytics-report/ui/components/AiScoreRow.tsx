'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { HintTooltip } from '@workspace/april-ui';
import {
    AI_LEVEL,
    AiMetricValue,
    aiKpiHintLines,
    aiSectionHintLines,
    formatAiCount,
    formatAiMoneyCompact,
    formatAiScore,
    pickAiCellSections,
    type AiByTypeWideRow,
} from '@/modules/entities/ai-analytics';
import { AiManagerName } from './AiManagerName';
import { AiCallTypeBadge } from './AiCallTypeBadge';
import { AiExplanationCell } from './AiExplanationCell';

interface AiScoreRowProps {
    row: AiByTypeWideRow;
    /** Имя и уровень менеджера — один раз на группу строк (false — ячейка пустая). */
    showManager: boolean;
    /** Колонка «Тип» (режим «все типы»): тип из ячейки обзора. */
    withType: boolean;
}

/**
 * Строка «широкой» раскладки: сотрудник | [тип] | n | оценка | 2–4 раздела
 * типа | главный KPI | финансовый хвост | объяснение с раскрытием.
 */
export const AiScoreRow = ({ row, showManager, withType }: AiScoreRowProps) => {
    const { cell, primaryKpi, finance } = row;
    const sections = pickAiCellSections(cell);

    return (
        <TableRow>
            <TableCell>
                {showManager && (
                    <>
                        <AiManagerName managerId={row.managerId} />
                        <span className="ml-2 text-[0.6875rem] text-muted-foreground">
                            {AI_LEVEL[row.level].label}
                        </span>
                    </>
                )}
            </TableCell>
            {withType && (
                <TableCell>
                    <AiCallTypeBadge code={cell.callType} />
                </TableCell>
            )}
            <TableCell className="text-right tabular-nums">{cell.n}</TableCell>
            <TableCell>
                <AiMetricValue metric={cell.score} kind="score" />
            </TableCell>
            <TableCell>
                {sections.length ? (
                    <ul className="space-y-0.5 text-xs">
                        {sections.map(section => (
                            <li
                                key={section.section}
                                className="flex justify-between gap-2"
                            >
                                <HintTooltip
                                    title={section.title}
                                    lines={aiSectionHintLines(section)}
                                >
                                    <span className="truncate text-muted-foreground">
                                        {section.title}
                                    </span>
                                </HintTooltip>
                                <span className="tabular-nums">
                                    {section.avgScore === null
                                        ? `n = ${section.n}`
                                        : formatAiScore(section.avgScore)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </TableCell>
            <TableCell className="text-right tabular-nums">
                {primaryKpi ? (
                    <HintTooltip
                        title={primaryKpi.code}
                        lines={aiKpiHintLines(primaryKpi)}
                    >
                        <span>
                            {formatAiCount(primaryKpi.fact)}
                            {primaryKpi.planCrm !== undefined && (
                                <span className="text-muted-foreground">
                                    {' '}
                                    / {formatAiCount(primaryKpi.planCrm)}
                                </span>
                            )}
                        </span>
                    </HintTooltip>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        {cell.kpiReason ?? '—'}
                    </span>
                )}
            </TableCell>
            <TableCell className="text-xs tabular-nums">
                <div>продаж {formatAiCount(finance.salesCount)}</div>
                <div>аванс {formatAiMoneyCompact(finance.advanceAmount)}</div>
                <div>чек {formatAiMoneyCompact(finance.monthlyAmount)}</div>
                <div className="text-muted-foreground">
                    пайплайн {finance.pipelineFromStage.count} ·{' '}
                    {formatAiMoneyCompact(
                        finance.pipelineFromStage.monthlyAmount,
                    )}
                </div>
            </TableCell>
            <TableCell>
                <AiExplanationCell cell={cell} />
            </TableCell>
        </TableRow>
    );
};
