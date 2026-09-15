'use client';

import { Fragment } from 'react';
import { Card } from '@workspace/ui/components/card';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    aiByTypeHiddenNote,
    applyAiByTypeVisibility,
    groupAiRowsByManager,
    isAiByTypeAll,
    pickAiByTypeVisibleRows,
    pickAiVisibleTypeTotals,
    type AiByTypeCallType,
    type AiByTypeWideRow,
    type AiTypeTotals,
} from '@/modules/entities/ai-analytics';
import { AiScoreRow } from './AiScoreRow';
import { AiScoreTotals } from './AiScoreTotals';
import { AiTypeTotalsList } from './AiTypeTotalsList';

interface AiScoreTableProps {
    rows: AiByTypeWideRow[];
    /** Выбранный тип; при «все типы» — колонка «Тип» и итоги по типам. */
    callType: AiByTypeCallType;
    /** Итог по домену для одного типа (null при «все типы» и возражениях). */
    totals: AiTypeTotals | null;
    /** Итоги по каждому типу (только при «все типы»). */
    totalsByType: AiTypeTotals[] | null;
}

/**
 * «Широкая» раскладка среза по типу: строка на менеджера + итог по домену.
 * В режиме «все типы» — строка на пару менеджер × тип, сгруппированы по
 * менеджеру (имя один раз), вместо итога — «Итоги по типам»; пары и типы
 * без звонков за период отсеяны, под таблицей — подпись об этом.
 */
export const AiScoreTable = ({
    rows,
    callType,
    totals,
    totalsByType,
}: AiScoreTableProps) => {
    const isAll = isAiByTypeAll(callType);
    const visibleRows = applyAiByTypeVisibility({
        callType,
        rows,
        pick: pickAiByTypeVisibleRows,
    });
    const visibleTotals = applyAiByTypeVisibility({
        callType,
        rows: totalsByType ?? [],
        pick: pickAiVisibleTypeTotals,
    });
    const hiddenNote = aiByTypeHiddenNote(
        visibleRows.hidden + visibleTotals.hidden,
    );

    if (!visibleRows.visible.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                {isAll
                    ? 'За период разобранных звонков в периметре нет.'
                    : 'По этому типу за период звонков в периметре нет.'}
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {isAll
                ? totalsByType && (
                      <AiTypeTotalsList totals={visibleTotals.visible} />
                  )
                : totals && <AiScoreTotals totals={totals} />}
            <Card className="overflow-x-auto p-2 bg-popover text-primary">
                <Table className="bg-popover text-primary">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-44">
                                Сотрудник
                            </TableHead>
                            {isAll && <TableHead>Тип</TableHead>}
                            <TableHead className="text-right">n</TableHead>
                            <TableHead>Оценка</TableHead>
                            <TableHead className="min-w-48">
                                Показатели типа
                            </TableHead>
                            <TableHead className="text-right">
                                Главный KPI
                            </TableHead>
                            <TableHead>Финансы</TableHead>
                            <TableHead className="min-w-64">
                                Объяснение
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupAiRowsByManager(visibleRows.visible).map(
                            group => (
                                <Fragment key={group.managerId}>
                                    {group.rows.map((row, index) => (
                                        <AiScoreRow
                                            key={row.cell.callType}
                                            row={row}
                                            showManager={!isAll || index === 0}
                                            withType={isAll}
                                        />
                                    ))}
                                </Fragment>
                            ),
                        )}
                    </TableBody>
                </Table>
            </Card>
            {hiddenNote && (
                <p className="text-xs text-muted-foreground">{hiddenNote}</p>
            )}
        </div>
    );
};
