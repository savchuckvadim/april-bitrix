import type { RTableProps } from '@workspace/april-ui';
import type { ConversionResult } from './conversion-calc.util';

/**
 * ConversionResult → RTableProps (для CSV-экспорта существующей утилитой).
 * Проценты округлены до 0.1; нерассчитываемые шаги (знаменатель 0) → 0.
 */
export const conversionResultToTableData = (
    result: ConversionResult,
): RTableProps => ({
    code: 'conversions',
    firstCellName: 'Менеджер',
    data: [
        ...result.rows.map(row => ({
            id: row.userId,
            name: row.name,
            actions: row.steps.map(step => ({
                name: `${step.fromName} → ${step.toName}, %`,
                value:
                    step.percent === null
                        ? 0
                        : Math.round(step.percent * 10) / 10,
            })),
        })),
        {
            name: 'Итого',
            actions: result.total.map(step => ({
                name: `${step.fromName} → ${step.toName}, %`,
                value:
                    step.percent === null
                        ? 0
                        : Math.round(step.percent * 10) / 10,
            })),
        },
    ],
});
