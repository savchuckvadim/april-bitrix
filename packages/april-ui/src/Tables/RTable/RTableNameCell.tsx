'use client';
import { FC } from 'react';
import Link from 'next/link';
import { TableCell } from '@workspace/ui/components/table';
import { RTableRow } from './rtable.types';

interface RTableNameCellProps {
    row: RTableRow;
    /** Имя — ссылка на user-report (выкл. на публичных страницах). */
    withLink?: boolean;
    onClick?: (id: number) => void;
}

/** Ячейка имени: ссылка на страницу сотрудника либо onClick-текст. */
export const RTableNameCell: FC<RTableNameCellProps> = ({
    row,
    withLink,
    onClick,
}) => (
    <TableCell className="font-medium">
        {withLink && row?.id ? (
            <Link
                href={`/report/user?userId=${row.id}`}
                className="text-primary hover:text-blue-700"
            >
                {row.name}
            </Link>
        ) : (
            <p onClick={() => row.id && onClick?.(row.id)}>{row.name}</p>
        )}
    </TableCell>
);
