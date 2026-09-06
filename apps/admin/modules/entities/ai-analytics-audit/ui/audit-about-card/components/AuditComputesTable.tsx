import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';
import type { AiAnalyticsAuditAboutItem } from '../../../model';

interface AuditComputesTableProps {
    items: readonly AiAnalyticsAuditAboutItem[];
}

/** Таблица «Что считает»: ключ report | показатель | описание. */
export const AuditComputesTable = ({ items }: AuditComputesTableProps) => (
    <div className="space-y-1.5">
        <h4 className="text-sm font-semibold">{AUDIT_TEXT.aboutComputes}</h4>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{AUDIT_TEXT.aboutComputeCode}</TableHead>
                    <TableHead>{AUDIT_TEXT.aboutComputeTitle}</TableHead>
                    <TableHead>{AUDIT_TEXT.aboutComputeDescription}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.code}>
                        <TableCell className="align-top">
                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                {item.code}
                            </code>
                        </TableCell>
                        <TableCell className="align-top font-medium whitespace-normal">
                            {item.title}
                        </TableCell>
                        <TableCell className="align-top whitespace-normal text-muted-foreground">
                            {item.description}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);
