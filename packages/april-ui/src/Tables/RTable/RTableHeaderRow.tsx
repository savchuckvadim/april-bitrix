'use client';
import { FC } from 'react';
import { TableHead, TableRow } from '@workspace/ui/components/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { RTableRow } from './rtable.types';

interface RTableHeaderRowProps {
    code: string;
    firstCellName: string;
    /** Первая строка данных — источник названий колонок. */
    templateRow: RTableRow | undefined;
}

/** Шапка таблицы: первая колонка + показатели (полное имя — в тултипе). */
export const RTableHeaderRow: FC<RTableHeaderRowProps> = ({
    code,
    firstCellName,
    templateRow,
}) => (
    <TableRow>
        <TableHead className="w-[190px] bg-popover text-primary">
            {firstCellName}
        </TableHead>
        {templateRow?.actions.map((action, i) => (
            <Tooltip key={`tooltip-rtable-head-${code}-column-${i}`}>
                <TooltipTrigger asChild>
                    <TableHead className="text-right bg-popover text-primary">
                        {action.name}
                    </TableHead>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                    {action.name}
                </TooltipContent>
            </Tooltip>
        ))}
    </TableRow>
);
