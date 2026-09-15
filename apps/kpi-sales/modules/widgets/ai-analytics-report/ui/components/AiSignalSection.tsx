'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import type { AiRowsSection } from '@/modules/entities/ai-analytics';
import { AiSignalRow } from './AiSignalRow';

interface AiSignalSectionProps {
    section: AiRowsSection;
    /** Число колонок таблицы — для строки-заголовка секции. */
    columns: number;
}

/** Секция таблицы (отдел/группа): строка-заголовок + строки менеджеров. */
export const AiSignalSection = ({ section, columns }: AiSignalSectionProps) => (
    <>
        {section.name && (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableCell
                    colSpan={columns}
                    className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                    {section.name}
                </TableCell>
            </TableRow>
        )}
        {section.rows.map(row => (
            <AiSignalRow key={row.managerId} row={row} />
        ))}
    </>
);
