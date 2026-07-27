'use client';
import { FC } from 'react';
import { TableCell } from '@workspace/ui/components/table';
import { AnnotationNote } from './AnnotationNote';
import { RTableAnnotation } from './rtable.types';

interface RTableValueCellProps {
    value: number;
    /** Аннотация «% конверсии» (первая подстрока, «↳ …»). */
    annotation: RTableAnnotation | undefined;
    /** План-аннотация «⌖ план · %» (вторая подстрока). */
    planAnnotation: RTableAnnotation | undefined;
}

/** Ячейка значения показателя с подстроками конверсии и плана. */
export const RTableValueCell: FC<RTableValueCellProps> = ({
    value,
    annotation,
    planAnnotation,
}) => (
    <TableCell className="text-right">
        {value}
        <AnnotationNote annotation={annotation} prefix="↳ " />
        <AnnotationNote annotation={planAnnotation} />
    </TableCell>
);
