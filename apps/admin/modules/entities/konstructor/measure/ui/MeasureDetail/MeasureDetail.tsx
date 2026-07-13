'use client';

import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    FieldList,
    formatFieldValue,
    type FieldRow,
} from '@/modules/entities/konstructor/lib';
import { useMeasure } from '../../lib/hooks';
import { MEASURE_COLUMNS } from '../../model';

/** Страница деталей глобальной единицы измерения (все поля, read-only). */
export function MeasureDetail({ id }: { id: number }) {
    const measure = useMeasure(id);

    const rows: FieldRow[] = measure.data
        ? MEASURE_COLUMNS.map((f) => ({
              label: f.label,
              value: formatFieldValue(measure.data[f.key]),
          }))
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        {measure.data?.name || `Единица #${id}`}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Глобальная единица измерения (read-only).
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/konstructor/measure">← К списку</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Все поля</CardTitle>
                </CardHeader>
                <CardContent>
                    {measure.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : measure.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить единицу измерения.
                        </p>
                    ) : (
                        <FieldList rows={rows} />
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                Редактирование справочника единиц измерения выполняется в admin.
            </p>
        </div>
    );
}
