'use client';
import { FC } from 'react';
import { TableHead, TableRow } from '@workspace/ui/components/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { RTABLE_HEADER_TEXT_CLASS } from './rtable.classes';
import { RTableRow } from './rtable.types';

interface RTableHeaderRowProps {
    code: string;
    firstCellName: string;
    /** Первая строка данных — источник названий колонок. */
    templateRow: RTableRow | undefined;
    /** Подсказки к колонкам по коду показателя (или имени, если кода нет). */
    columnHints?: Map<string, string>;
    /** Клик по заголовку колонки (код показателя или имя). */
    onColumnClick?: (code: string) => void;
}

/** Знак у колонки с подсказкой. */
const HINT_MARK = '*';

/**
 * Шапка таблицы: первая колонка + показатели. Длинное название колонки
 * обрезается «…» (RTABLE_HEADER_TEXT_CLASS), полное — в тултипе.
 * Колонка с подсказкой помечена звёздочкой, подсказка — второй строкой
 * тултипа. С onColumnClick заголовок — кнопка; headerClassName показателя
 * первой строки — класс ячейки шапки.
 */
export const RTableHeaderRow: FC<RTableHeaderRowProps> = ({
    code,
    firstCellName,
    templateRow,
    columnHints,
    onColumnClick,
}) => (
    <TableRow>
        <TableHead className="w-[190px] bg-popover text-primary">
            {firstCellName}
        </TableHead>
        {templateRow?.actions.map((action, i) => {
            const key = action.code ?? action.name;
            const hint = columnHints?.get(key);
            return (
                <Tooltip key={`tooltip-rtable-head-${code}-column-${i}`}>
                    <TooltipTrigger asChild>
                        <TableHead
                            className={cn(
                                'text-right bg-popover text-primary',
                                onColumnClick &&
                                    'cursor-pointer hover:underline',
                                action.headerClassName,
                            )}
                            role={onColumnClick ? 'button' : undefined}
                            onClick={
                                onColumnClick
                                    ? () => onColumnClick(key)
                                    : undefined
                            }
                        >
                            <span className="flex justify-end">
                                <span className={RTABLE_HEADER_TEXT_CLASS}>
                                    {action.name}
                                </span>
                                {hint && <span aria-hidden>{HINT_MARK}</span>}
                            </span>
                        </TableHead>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[320px] whitespace-pre-line text-xs">
                        <div>{action.name}</div>
                        {hint && <div className="opacity-80">{hint}</div>}
                    </TooltipContent>
                </Tooltip>
            );
        })}
    </TableRow>
);
