'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
    errorMessage,
    useSeedCatalog,
} from '../../lib/hooks/use-catalog-table';
import {
    CATALOG_SEED_SECTIONS,
    CatalogSeedSection,
    TableImportReportDto,
} from '../../model';
import { ImportReport } from '../import-report/ImportReport';

/**
 * Первое наполнение каталога: создаёт стандартные справочники, если их
 * ещё нет. Существующие записи не меняются — поэтому нажать можно
 * спокойно, даже когда часть данных уже заведена.
 */
export function CatalogSeedCard() {
    const seed = useSeedCatalog();
    const [sections, setSections] = React.useState<CatalogSeedSection[]>(
        CATALOG_SEED_SECTIONS.map(item => item.section),
    );
    const [reports, setReports] = React.useState<
        TableImportReportDto[] | null
    >(null);
    const [applied, setApplied] = React.useState(false);

    const toggle = (section: CatalogSeedSection, checked: boolean): void => {
        setSections(previous =>
            checked
                ? [...previous, section]
                : previous.filter(item => item !== section),
        );
        setReports(null);
    };

    const run = async (dryRun: boolean): Promise<void> => {
        const result = await seed.mutateAsync({ sections, dryRun });
        setReports(result);
        setApplied(!dryRun);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Первое наполнение каталога</CardTitle>
                <CardDescription>
                    Создаёт стандартные справочники на новой базе. Не
                    обязательно: загрузка таблицы цен заводит их сама. Нужно,
                    когда справочники хочется получить до цен. Всё, что уже
                    заведено, остаётся как есть — существующие записи не
                    перезаписываются.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <section className="space-y-3">
                    {CATALOG_SEED_SECTIONS.map(item => (
                        <div key={item.section} className="flex gap-3">
                            <Checkbox
                                id={`seed-${item.section}`}
                                checked={sections.includes(item.section)}
                                onCheckedChange={checked =>
                                    toggle(item.section, checked === true)
                                }
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor={`seed-${item.section}`}
                                    className="font-medium"
                                >
                                    {item.title}
                                </Label>
                                <p className="text-muted-foreground text-sm">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="space-y-2">
                    <h3 className="text-sm font-medium">
                        Что делать после наполнения
                    </h3>
                    <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-sm">
                        <li>
                            Скачайте таблицу цен — в ней уже будут нужные
                            строки и колонки, но пустые ячейки.
                        </li>
                        <li>Впишите цены и загрузите файл обратно.</li>
                        <li>
                            Так же заполните рабсы регионов, коэффициенты и
                            тексты видов поставок.
                        </li>
                        <li>
                            Состав инфоблоков у комплектов добавьте в карточке
                            каждого комплекта.
                        </li>
                    </ol>
                </section>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => void run(true)}
                        disabled={sections.length === 0 || seed.isPending}
                    >
                        {seed.isPending ? 'Считаем…' : 'Проверить'}
                    </Button>
                    <Button
                        onClick={() => void run(false)}
                        disabled={sections.length === 0 || seed.isPending}
                    >
                        Создать отсутствующее
                    </Button>
                </div>

                {seed.isError && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {errorMessage(seed.error)}
                        </AlertDescription>
                    </Alert>
                )}

                {reports && (
                    <ImportReport reports={reports} applied={applied} />
                )}
            </CardContent>
        </Card>
    );
}
