'use client';
import { FC } from 'react';
import { TableCell } from '@workspace/ui/components/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { AnnotationNote } from './AnnotationNote';
import { RTableAction, RTableAnnotation } from './rtable.types';

interface RTableValueCellProps {
    /** Значение показателя: число, текст вместо него, класс и подсказка ячейки. */
    action: RTableAction;
    /** Аннотация «% конверсии» (первая подстрока, «↳ …»). */
    annotation: RTableAnnotation | undefined;
    /** План-аннотация «⌖ план · %» (вторая подстрока). */
    planAnnotation: RTableAnnotation | undefined;
}

/**
 * Ячейка значения показателя с подстроками конверсии и плана. Если у
 * значения есть display — показывается он (число остаётся в данных для
 * рейтингов и CSV); tooltip оборачивает всю ячейку.
 */
export const RTableValueCell: FC<RTableValueCellProps> = ({
    action,
    annotation,
    planAnnotation,
}) => {
    const body = (
        <div className={action.tooltip ? 'cursor-help' : undefined}>
            <span className={action.className}>
                {action.display ?? action.value}
            </span>
            <AnnotationNote annotation={annotation} prefix="↳ " />
            <AnnotationNote annotation={planAnnotation} />
        </div>
    );

    return (
        <TableCell className="text-right">
            {action.tooltip ? (
                <Tooltip>
                    <TooltipTrigger asChild>{body}</TooltipTrigger>
                    <TooltipContent className="max-w-[320px] whitespace-pre-line text-xs">
                        {action.tooltip}
                    </TooltipContent>
                </Tooltip>
            ) : (
                body
            )}
        </TableCell>
    );
};
