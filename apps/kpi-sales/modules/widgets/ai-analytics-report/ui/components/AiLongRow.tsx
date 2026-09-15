'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { ToneBadge } from '@workspace/april-ui';
import {
    AI_LONG_KIND,
    AiMetricValue,
    aiLongRowMetricKind,
    type AiByTypeLongRow,
} from '@/modules/entities/ai-analytics';
import { AiManagerName } from './AiManagerName';
import { AiCallTypeBadge } from './AiCallTypeBadge';

interface AiLongRowProps {
    row: AiByTypeLongRow;
    /** Имя менеджера — один раз на группу строк (false — ячейка пустая). */
    showManager: boolean;
    /** Колонка «Тип» (режим «все типы»). */
    withType: boolean;
}

/** Строка «длинной» раскладки: сотрудник | [тип] | показатель | оценка | объяснение. */
export const AiLongRow = ({ row, showManager, withType }: AiLongRowProps) => {
    const kind = AI_LONG_KIND[row.kind];

    return (
        <TableRow>
            <TableCell>
                {showManager && <AiManagerName managerId={row.managerId} />}
            </TableCell>
            {withType && (
                <TableCell>
                    <AiCallTypeBadge code={row.callType} />
                </TableCell>
            )}
            <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                    <ToneBadge tone={kind.tone} variant="outline" size="sm">
                        {kind.label}
                    </ToneBadge>
                    <span>{row.title}</span>
                </div>
            </TableCell>
            <TableCell>
                <AiMetricValue
                    metric={row.metric}
                    kind={aiLongRowMetricKind(row.kind)}
                    withDetails={row.kind !== 'kpi'}
                />
            </TableCell>
            <TableCell className="text-sm">{row.explanation}</TableCell>
        </TableRow>
    );
};
