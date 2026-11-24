'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    PROVIDER_IMAGE_LEGACY_TEXT,
    legacyImportRowKey,
    legacyRoleLabel,
    type ProviderImageLegacyImportRow,
} from '@/modules/entities/portal-provider/provider-image';
import { LegacyImportStatusBadge } from './LegacyImportStatusBadge';

interface LegacyImportTableProps {
    rows: readonly ProviderImageLegacyImportRow[];
}

const COLUMNS = PROVIDER_IMAGE_LEGACY_TEXT.columns;

/** Таблица отчёта: портал, реквизиты, роль, файл легаси, статус и пояснение бэка. */
export function LegacyImportTable({ rows }: LegacyImportTableProps) {
    return (
        <div className="max-h-[50vh] overflow-auto rounded-md border">
            <Table>
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                        <TableHead>{COLUMNS.portal}</TableHead>
                        <TableHead>{COLUMNS.rq}</TableHead>
                        <TableHead>{COLUMNS.role}</TableHead>
                        <TableHead>{COLUMNS.file}</TableHead>
                        <TableHead>{COLUMNS.status}</TableHead>
                        <TableHead>{COLUMNS.message}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={legacyImportRowKey(row)}>
                            <TableCell>
                                {row.portalDomain ?? PROVIDER_IMAGE_LEGACY_TEXT.unknownPortal}
                            </TableCell>
                            <TableCell>
                                <div>{row.rqName ?? PROVIDER_IMAGE_LEGACY_TEXT.unnamedRq}</div>
                                <div className="text-xs text-muted-foreground">
                                    {PROVIDER_IMAGE_LEGACY_TEXT.rqNumber(row.rqId)}
                                </div>
                            </TableCell>
                            <TableCell>
                                {legacyRoleLabel(row.role) ?? PROVIDER_IMAGE_LEGACY_TEXT.unknownRole}
                            </TableCell>
                            <TableCell className="max-w-64">
                                <div className="truncate" title={row.legacyPath}>
                                    {row.legacyPath}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {PROVIDER_IMAGE_LEGACY_TEXT.legacyFileNumber(row.legacyFileId)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <LegacyImportStatusBadge status={row.status} />
                            </TableCell>
                            <TableCell className="max-w-72 whitespace-normal text-muted-foreground">
                                {row.message ?? ''}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
