'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import type { TableImportReportDto } from '../../model';
import { summarizeReports } from '../../model';

interface ImportReportProps {
    reports: TableImportReportDto[];
    /** true — изменения уже применены, false — это была проверка */
    applied: boolean;
}

/**
 * Результат разбора файла: сводка и, если что-то не применено,
 * построчный разбор причин. Показывается и после проверки, и после записи.
 */
export function ImportReport({ reports, applied }: ImportReportProps) {
    const summary = summarizeReports(reports);
    const skippedRows = reports.flatMap(report =>
        report.skipped.map(row => ({ section: report.section, ...row })),
    );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                    {applied ? 'Изменения сохранены:' : 'Проверка файла:'}
                </span>
                {summary.created > 0 && (
                    <Badge variant="default">
                        {applied ? 'добавлено' : 'будет добавлено'}:{' '}
                        {summary.created}
                    </Badge>
                )}
                {summary.updated > 0 && (
                    <Badge variant="default">
                        {applied ? 'обновлено' : 'будет обновлено'}:{' '}
                        {summary.updated}
                    </Badge>
                )}
                {summary.unchanged > 0 && (
                    <Badge variant="secondary">
                        без изменений: {summary.unchanged}
                    </Badge>
                )}
                {summary.skipped > 0 && (
                    <Badge variant="destructive">
                        не применено: {summary.skipped}
                    </Badge>
                )}
                {!summary.hasChanges && summary.skipped === 0 && (
                    <Badge variant="secondary">
                        файл совпадает с текущими данными
                    </Badge>
                )}
            </div>

            <div className="text-muted-foreground text-xs">
                {reports
                    .map(
                        report =>
                            `${sectionTitle(report.section)}: +${report.created} / ~${report.updated} / =${report.unchanged}`,
                    )
                    .join(' · ')}
            </div>

            {skippedRows.length > 0 && (
                <Accordion type="single" collapsible>
                    <AccordionItem value="skipped">
                        <AccordionTrigger className="text-sm">
                            Почему {skippedRows.length} строк не применено
                        </AccordionTrigger>
                        <AccordionContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-40">
                                            Лист
                                        </TableHead>
                                        <TableHead className="w-56">
                                            Строка
                                        </TableHead>
                                        <TableHead>Причина</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {skippedRows.map((row, index) => (
                                        <TableRow
                                            key={`${row.section}-${row.key}-${index}`}
                                        >
                                            <TableCell className="text-muted-foreground text-xs">
                                                {sectionTitle(row.section)}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs">
                                                {row.key}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {row.reason}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    );
}

/** Понятные названия листов и секций вместо их кодов */
const SECTION_TITLES: Record<string, string> = {
    'prof-prices-msc': 'Прайс PROF, Москва',
    'prof-prices-regions': 'Прайс PROF, регионы',
    'universal-weights': 'Универсальная линейка',
    regions: 'Стоимость рабса по регионам',
    lt: 'Пакеты ЛегалТех',
    star: 'СТАР',
    consalting: 'Консалтинг',
    supplies: 'Виды поставок',
    complects: 'Комплекты',
    packages: 'Пакеты услуг',
    'seed:supplies': 'Виды поставок',
    'seed:universalComplects': 'Универсальная линейка',
    'seed:servicePackages': 'Пакеты услуг',
};

export const sectionTitle = (section: string): string =>
    SECTION_TITLES[section] ?? section;
