import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { MarkdownInline } from './MarkdownInline';

interface MarkdownTableProps {
    headers: readonly string[];
    rows: readonly (readonly string[])[];
}

/** Markdown-таблица отчёта на shadcn Table; числовые колонки — tabular-nums. */
export const MarkdownTable = ({ headers, rows }: MarkdownTableProps) => (
    <Table className="text-xs">
        <TableHeader>
            <TableRow>
                {headers.map((header, index) => (
                    <TableHead key={index} className="h-8">
                        <MarkdownInline text={header} />
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="tabular-nums">
                            <MarkdownInline text={cell} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    </Table>
);
