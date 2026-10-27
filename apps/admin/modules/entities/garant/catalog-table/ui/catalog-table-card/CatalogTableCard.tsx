'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { Separator } from '@workspace/ui/components/separator';
import { useTableImportState } from '../../lib/hooks/use-catalog-table';
import { CatalogTableInfo } from '../../model';
import { ImportReport } from '../import-report/ImportReport';

interface CatalogTableCardProps {
    table: CatalogTableInfo;
}

/**
 * Одна таблица каталога: инструкция и три шага — скачать текущие данные,
 * проверить заполненный файл, сохранить. Проверка обязательна до
 * сохранения: сначала видно, что именно поменяется.
 */
export function CatalogTableCard({ table }: CatalogTableCardProps) {
    const {
        exportTable,
        importTable,
        file,
        reports,
        isChecked,
        applied,
        selectFile,
        check,
        apply,
        error,
    } = useTableImportState(table.kind);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        selectFile(event.target.files?.[0] ?? null);
    };

    const resetFile = (): void => {
        selectFile(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{table.title}</CardTitle>
                <CardDescription>{table.summary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <section className="space-y-2">
                    <h3 className="text-sm font-medium">Как заполнять</h3>
                    <ol className="text-muted-foreground list-decimal space-y-1 pl-5 text-sm">
                        {table.instructions.map(line => (
                            <li key={line}>{line}</li>
                        ))}
                    </ol>
                    {table.warnings?.map(warning => (
                        <Alert key={warning}>
                            <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                    ))}
                </section>

                <Separator />

                <section className="space-y-3">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium">
                            Шаг 1. Скачать файл
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {table.canDownloadBlank
                                ? 'С текущими данными — правите то, что есть. Пустой — те же строки и колонки, но без значений: удобно вносить новый прайс с нуля.'
                                : 'В файле уже всё, что сейчас в системе — правьте прямо в нём.'}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                exportTable.mutate({
                                    kind: table.kind,
                                    mode: 'current',
                                })
                            }
                            disabled={exportTable.isPending}
                        >
                            {exportTable.isPending
                                ? 'Готовим файл…'
                                : 'С текущими данными'}
                        </Button>
                        {table.canDownloadBlank && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    exportTable.mutate({
                                        kind: table.kind,
                                        mode: 'blank',
                                    })
                                }
                                disabled={exportTable.isPending}
                            >
                                Пустой файл
                            </Button>
                        )}
                    </div>
                    {exportTable.isError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                Не удалось скачать файл. Попробуйте ещё раз.
                            </AlertDescription>
                        </Alert>
                    )}
                </section>

                <section className="space-y-3">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium">
                            Шаг 2. Проверить заполненный файл
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Покажем, что изменится, и ничего не сохраним.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileChange}
                            className="max-w-sm"
                        />
                        <Button
                            variant="outline"
                            onClick={() => void check()}
                            disabled={!file || importTable.isPending}
                        >
                            {importTable.isPending && !applied
                                ? 'Проверяем…'
                                : 'Проверить'}
                        </Button>
                        {file && (
                            <Button variant="ghost" onClick={resetFile}>
                                Убрать файл
                            </Button>
                        )}
                    </div>
                </section>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {reports && <ImportReport reports={reports} applied={applied} />}

                <section className="space-y-3">
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium">
                            Шаг 3. Сохранить изменения
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {isChecked && !applied
                                ? 'Проверка пройдена — можно сохранять.'
                                : 'Кнопка станет доступна после проверки файла.'}
                        </p>
                    </div>
                    <Button
                        onClick={() => void apply()}
                        disabled={
                            !file ||
                            !isChecked ||
                            applied ||
                            importTable.isPending
                        }
                    >
                        {applied ? 'Сохранено' : 'Сохранить в каталог'}
                    </Button>
                    {applied && (
                        <Alert>
                            <AlertDescription>
                                Данные обновлены. Чтобы загрузить ещё один
                                файл, выберите его заново.
                            </AlertDescription>
                        </Alert>
                    )}
                </section>
            </CardContent>
        </Card>
    );
}
