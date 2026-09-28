'use client';

import { RTable } from '@workspace/april-ui';
import { selectIsPublic, useAppSelector } from '@/modules/app';
import type { AiMatrixTable as AiMatrixTableData } from '@/modules/entities/ai-analytics';
import { AI_MATRIX_SECTION_EMPTY_TEXT } from '../../lib/ai-types-matrix-view.util';

interface AiMatrixTableProps {
    matrix: AiMatrixTableData;
    /** Текст вместо таблицы, когда строк нет (секция без менеджеров). */
    emptyText?: string;
}

/**
 * Матрица KPI-вида на RTable april-ui: значения-счётчики с подстрокой
 * оценки (annotations по ключу `${id}:${code}`); в публичном снимке имена
 * без ссылок на user-report — как KPIReportTable.
 */
export const AiMatrixTable = ({
    matrix,
    emptyText = AI_MATRIX_SECTION_EMPTY_TEXT,
}: AiMatrixTableProps) => {
    const isPublic = useAppSelector(selectIsPublic);

    if (!matrix.table.data.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">{emptyText}</p>
        );
    }

    return (
        <RTable
            code={matrix.table.code}
            firstCellName={matrix.table.firstCellName}
            data={matrix.table.data}
            withLink={!isPublic}
            annotations={matrix.annotations}
        />
    );
};
