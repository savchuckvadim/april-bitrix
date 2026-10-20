'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import type { AiRowsSection } from '@/modules/entities/ai-analytics';
import {
    aiSignalColumnCount,
    type AiSignalColumns,
} from '../../lib/ai-signal.util';
import type { AiSignalRowContext } from '../../hooks/use-ai-signal-row-context';
import { AiSignalRow } from './AiSignalRow';

interface AiSignalSectionProps {
    section: AiRowsSection;
    /** Видимые колонки «Тренды» / «Год назад» / «План руководителя» — и для colSpan заголовка секции. */
    columns: AiSignalColumns;
    /** Общий для строк контекст (статус разбора, период, ожидаемая доля плана). */
    context: AiSignalRowContext;
    /** Открыть карточку стиля менеджера. */
    onOpenStyle: (managerId: string) => void;
    /** Открыть досье менеджера. */
    onOpenDossier: (managerId: string) => void;
}

/** Секция таблицы (отдел/группа): строка-заголовок + строки менеджеров. */
export const AiSignalSection = ({
    section,
    columns,
    context,
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
                context={context}
                onOpenStyle={onOpenStyle}
                onOpenDossier={onOpenDossier}
            />
        ))}
    </>
);
