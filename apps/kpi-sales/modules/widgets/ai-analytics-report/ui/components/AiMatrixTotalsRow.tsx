'use client';

import { RTable } from '@workspace/april-ui';
import type { AiMatrixTotalsTable } from '@/modules/entities/ai-analytics';

interface AiMatrixTotalsRowProps {
    totals: AiMatrixTotalsTable;
    /** Подсказки шапки — те же, что у основной таблицы. */
    columnHints?: Map<string, string>;
}

/**
 * Строка «Итого по отделу» под матрицей (как KPIReportTotalTable):
 * отдельная RTable с одной строкой без ссылки на сотрудника. Ячейка —
 * «6,8 из 10», мелко «по 42 звонкам · 3 сотр.» либо «ещё 4 до оценки».
 */
export const AiMatrixTotalsRow = ({ totals, columnHints }: AiMatrixTotalsRowProps) => (
    <RTable
        code={totals.table.code}
        firstCellName={totals.table.firstCellName}
        data={totals.table.data}
        withLink={false}
        annotations={totals.annotations}
        columnHints={columnHints ?? totals.table.columnHints}
    />
);
