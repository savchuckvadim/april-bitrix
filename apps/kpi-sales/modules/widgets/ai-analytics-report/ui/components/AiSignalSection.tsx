'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import type { AiRowsSection } from '@/modules/entities/ai-analytics';
import {
    aiSignalColumnCount,
    type AiSignalColumns,
} from '../../lib/ai-signal.util';
import { AiSignalRow } from './AiSignalRow';

interface AiSignalSectionProps {
    section: AiRowsSection;
    /** Видимые колонки «Тренды» / «Год назад» — и для colSpan заголовка секции. */
    columns: AiSignalColumns;
    /** Открыть карточку стиля менеджера. */
    onOpenStyle: (managerId: string) => void;
    /** Открыть досье менеджера. */
    onOpenDossier: (managerId: string) => void;
}

/** Секция таблицы (отдел/группа): строка-заголовок + строки менеджеров. */
export const AiSignalSection = ({
    section,
    columns,
    onOpenStyle,
    onOpenDossier,
}: AiSignalSectionProps) => (
    <>
        {section.name && (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableCell
                    colSpan={aiSignalColumnCount(columns)}
                    className="py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                    {section.name}
                </TableCell>
            </TableRow>
        )}
        {section.rows.map(row => (
            <AiSignalRow
                key={row.managerId}
                row={row}
                columns={columns}
                onOpenStyle={onOpenStyle}
                onOpenDossier={onOpenDossier}
            />
        ))}
    </>
);
