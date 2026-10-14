'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import {
    DIGEST_TABLE_METRICS,
    type DigestRow,
} from '@/modules/entities/digest';
import {
    breakdownLines,
    reasonLines,
    type NameMap,
} from '../../lib/catalog-names.util';
import { countMetricOf } from '../lib/digest-table.util';
import { DigestMetricCell } from './DigestMetricCell';

interface DigestTableRowProps {
    row: DigestRow;
    names: { types: NameMap; reasons: NameMap };
    focused: boolean;
    onFocus: (userId: number) => void;
}

/** Строка сотрудника: имя (клик — фокус) и метрики с разбивками. */
export const DigestTableRow = ({ row, names, focused, onFocus }: DigestTableRowProps) => (
    <TableRow className={cn(focused && 'bg-primary/10')}>
        <TableCell className="font-medium">
            <button
                type="button"
                className={cn(
                    'text-left hover:text-primary',
                    focused && 'text-primary',
                )}
                title={focused ? 'Снять фокус' : 'Показать только этого сотрудника'}
                onClick={() => onFocus(row.userId)}
            >
                {row.name}
            </button>
        </TableCell>
        {DIGEST_TABLE_METRICS.map(code => {
            const count = countMetricOf(row.employee, code);
            const lines = count ? breakdownLines(count, names.types) : [];
            if (code === 'notHeld') {
                lines.push(...reasonLines(row.employee.noresultReasons, names.reasons).map(
                    line => `причина — ${line}`,
                ));
            }
            return (
                <DigestMetricCell
                    key={code}
                    code={code}
                    value={row.values[code]}
                    lines={lines}
                />
            );
        })}
    </TableRow>
);
