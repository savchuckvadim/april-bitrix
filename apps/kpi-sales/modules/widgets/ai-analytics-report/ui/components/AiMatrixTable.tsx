'use client';

import { RTable } from '@workspace/april-ui';
import { selectIsPublic, useAppSelector } from '@/modules/app';
import type {
    AiMatrixTable as AiMatrixTableData,
    AiMatrixTotalsTable,
} from '@/modules/entities/ai-analytics';
import { AI_MATRIX_BLOCK_TEXT } from '../../lib/ai-matrix-texts';
import { AiMatrixTotalsRow } from './AiMatrixTotalsRow';

interface AiMatrixTableProps {
    matrix: AiMatrixTableData;
    /** Строка «Итого по отделу» под таблицей; null — без неё. */
    totals?: AiMatrixTotalsTable | null;
    /** Подсказки шапки (что значит колонка); нет — пометки сущности из матрицы. */
    columnHints?: Map<string, string>;
    /** Клик по заголовку колонки (открыть срез по типу). */
    onColumnClick?: (code: string) => void;
    /** Текст вместо таблицы, когда строк нет (секция без менеджеров). */
    emptyText?: string;
}

/**
 * Матрица KPI-вида на RTable april-ui: оценка крупно, объём подстрокой
 * (annotations по ключу `${id}:${code}`), цвет относительно итога; под
 * ней строка «Итого по отделу». В публичном снимке имена без ссылок на
 * user-report — как KPIReportTable.
 */
export const AiMatrixTable = ({
    matrix,
    totals = null,
    columnHints,
    onColumnClick,
    emptyText = AI_MATRIX_BLOCK_TEXT.sectionEmpty,
}: AiMatrixTableProps) => {
    const isPublic = useAppSelector(selectIsPublic);
    const hints = columnHints ?? matrix.table.columnHints;

    if (!matrix.table.data.length) {
        return <p className="py-2 text-xs text-muted-foreground">{emptyText}</p>;
    }

    return (
        <>
            <RTable
                code={matrix.table.code}
                firstCellName={matrix.table.firstCellName}
                data={matrix.table.data}
                withLink={!isPublic}
                annotations={matrix.annotations}
                columnHints={hints}
                onColumnClick={onColumnClick}
            />
            {totals && <AiMatrixTotalsRow totals={totals} columnHints={hints} />}
        </>
    );
};
