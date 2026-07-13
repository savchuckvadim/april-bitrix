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
import { useContract } from '../../lib/hooks';
import { CONTRACT_FIELD_LABELS } from '../../model';

/** Страница деталей глобального вида договора (все поля, read-only). */
export function ContractDetail({ id }: { id: number }) {
    const contract = useContract(id);

    const rows: FieldRow[] = contract.data
        ? CONTRACT_FIELD_LABELS.map((f) => ({
              label: f.label,
              value: formatFieldValue(contract.data[f.key]),
          }))
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        {contract.data?.title || contract.data?.name || `Договор #${id}`}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Глобальный вид договора (read-only).
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/konstructor/contract">← К списку</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Все поля</CardTitle>
                </CardHeader>
                <CardContent>
                    {contract.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : contract.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить договор.
                        </p>
                    ) : (
                        <FieldList rows={rows} />
                    )}
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                Редактирование справочника видов договоров выполняется в admin.
            </p>
        </div>
    );
}
