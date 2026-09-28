'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ToneBadge } from '@workspace/april-ui';
import {
    AiMetricValue,
    aiCellChecklistEntries,
    aiRestKpi,
    formatAiCalls,
    formatAiKpiLine,
    type AiManagerTypeCell,
} from '@/modules/entities/ai-analytics';

interface AiExplanationCellProps {
    cell: AiManagerTypeCell;
}

/**
 * Объяснение оценки ячейки (текст бэка) с раскрытием: остальные показатели
 * CRM типа, чек-листы, звонки до начала сравнимой истории. Идентификаторы
 * опорных звонков и служебные опоры чисел в интерфейс не выводятся —
 * ссылок на разборы пока нет.
 */
export const AiExplanationCell = ({ cell }: AiExplanationCellProps) => {
    const [open, setOpen] = useState(false);
    const restKpi = aiRestKpi(cell);
    const checklists = aiCellChecklistEntries(cell);
    const hasDetails =
        restKpi.length > 0 ||
        checklists.length > 0 ||
        cell.nBeforeComparable > 0;

    return (
        <div className="min-w-64 space-y-1 text-sm">
            <p>{cell.explanation.text}</p>
            <div className="flex flex-wrap items-center gap-2">
                {cell.versionsMixed && (
                    <ToneBadge tone="warning" variant="soft" size="sm">
                        смешаны версии разбора
                    </ToneBadge>
                )}
                {cell.explanation.source === 'llm' && (
                    <ToneBadge tone="info" variant="soft" size="sm">
                        написано AI
                    </ToneBadge>
                )}
                {hasDetails && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1 px-1 text-xs"
                        aria-expanded={open}
                        onClick={() => setOpen(value => !value)}
                    >
                        {open ? (
                            <ChevronDown className="h-3 w-3" />
                        ) : (
                            <ChevronRight className="h-3 w-3" />
                        )}
                        Подробнее
                    </Button>
                )}
            </div>
            {open && hasDetails && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {restKpi.length > 0 && (
                        <>
                            <dt>Показатели типа</dt>
                            <dd className="text-foreground">
                                {restKpi.map(formatAiKpiLine).join(' · ')}
                            </dd>
                        </>
                    )}
                    {checklists.map(item => (
                        <div key={item.key} className="contents">
                            <dt>{item.label}</dt>
                            <dd>
                                <AiMetricValue
                                    metric={item.metric}
                                    kind="pct"
                                    withDetails
                                />
                            </dd>
                        </div>
                    ))}
                    {cell.nBeforeComparable > 0 && (
                        <>
                            <dt>Не в оценке</dt>
                            <dd className="text-foreground">
                                {formatAiCalls(cell.nBeforeComparable)} до
                                начала сравнимой истории
                            </dd>
                        </>
                    )}
                </dl>
            )}
        </div>
    );
};
