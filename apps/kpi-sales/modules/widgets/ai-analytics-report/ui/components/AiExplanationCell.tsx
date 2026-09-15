'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { ToneBadge } from '@workspace/april-ui';
import {
    AiMetricValue,
    aiCellChecklistEntries,
    aiEvidenceEntries,
    aiRestKpi,
    formatAiKpiLine,
    type AiManagerTypeCell,
} from '@/modules/entities/ai-analytics';

interface AiExplanationCellProps {
    cell: AiManagerTypeCell;
}

/**
 * Объяснение оценки ячейки (шаблон бэка) с раскрытием: опоры чисел,
 * опорные звонки (лучший / худший / медианный), остальные KPI типа и
 * чек-листы. Ссылок на транскрипции по id пока нет — показываем id.
 */
export const AiExplanationCell = ({ cell }: AiExplanationCellProps) => {
    const [open, setOpen] = useState(false);
    const evidence = aiEvidenceEntries(cell);
    const restKpi = aiRestKpi(cell);
    const checklists = aiCellChecklistEntries(cell);

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
                        LLM
                    </ToneBadge>
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-1 text-xs"
                    onClick={() => setOpen(value => !value)}
                >
                    {open ? (
                        <ChevronDown className="h-3 w-3" />
                    ) : (
                        <ChevronRight className="h-3 w-3" />
                    )}
                    Подробнее
                </Button>
            </div>
            {open && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {evidence.length > 0 && (
                        <>
                            <dt>Звонки-опоры</dt>
                            <dd className="text-foreground">
                                {evidence
                                    .map(
                                        item =>
                                            `${item.label}: ${item.transcriptionId}`,
                                    )
                                    .join(' · ')}
                            </dd>
                        </>
                    )}
                    {cell.explanation.basis.length > 0 && (
                        <>
                            <dt>Опоры чисел</dt>
                            <dd className="text-foreground">
                                {cell.explanation.basis.join(' · ')}
                            </dd>
                        </>
                    )}
                    {restKpi.length > 0 && (
                        <>
                            <dt>KPI типа</dt>
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
                            <dt>До сопоставимости</dt>
                            <dd className="text-foreground">
                                {cell.nBeforeComparable} звонков не в оценке
                            </dd>
                        </>
                    )}
                </dl>
            )}
        </div>
    );
};
