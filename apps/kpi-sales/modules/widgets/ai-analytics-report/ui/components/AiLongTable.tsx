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
    pickAiByTypeVisibleLongRows,
    type AiByTypeCallType,
    type AiByTypeLongRow,
} from '@/modules/entities/ai-analytics';
import { AiLongRow } from './AiLongRow';

interface AiLongTableProps {
    rows: AiByTypeLongRow[];
    /** Выбранный тип; при «все типы» — колонка «Тип», имя менеджера один раз. */
    callType: AiByTypeCallType;
}

/**
 * «Длинная» раскладка — буквальная форма постановки: строка на
 * (сотрудник × показатель): сотрудник | [тип] | показатель | оценка | объяснение.
 * В режиме «все типы» строки сгруппированы по менеджеру, пары менеджер × тип
 * без звонков за период отсеяны, под таблицей — подпись об этом.
 */
export const AiLongTable = ({ rows, callType }: AiLongTableProps) => {
    const isAll = isAiByTypeAll(callType);
    const { visible, hidden } = applyAiByTypeVisibility({
        callType,
        rows,
        pick: pickAiByTypeVisibleLongRows,
    });
    const hiddenNote = aiByTypeHiddenNote(hidden);

    if (!visible.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                {isAll
                    ? 'За период показателей в периметре нет.'
                    : 'По этому типу за период показателей нет.'}
            </p>
        );
    }

    return (
        <div className="space-y-2">
            <Card className="overflow-x-auto p-2 bg-popover text-primary">
                <Table className="bg-popover text-primary">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-44">
                                Сотрудник
                            </TableHead>
                            {isAll && <TableHead>Тип</TableHead>}
                            <TableHead className="min-w-48">
                                Показатель
                            </TableHead>
                            <TableHead>Оценка</TableHead>
                            <TableHead className="min-w-64">
                                Объяснение
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupAiRowsByManager(visible).map(group => (
                            <Fragment key={group.managerId}>
                                {group.rows.map((row, index) => (
                                    <AiLongRow
                                        key={`${row.callType}-${row.kind}-${row.indicator}-${index}`}
                                        row={row}
                                        showManager={!isAll || index === 0}
                                        withType={isAll}
                                    />
                                ))}
                            </Fragment>
                        ))}
                    </TableBody>
                </Table>
            </Card>
            {hiddenNote && (
                <p className="text-xs text-muted-foreground">{hiddenNote}</p>
            )}
        </div>
    );
};
