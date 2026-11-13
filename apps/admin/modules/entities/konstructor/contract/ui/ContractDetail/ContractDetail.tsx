'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { FieldList } from '@/modules/entities/konstructor/lib';
import { ContractEditDialog } from '../ContractEditDialog/ContractEditDialog';
import { useContractDetail } from './hooks/use-contract-detail';

/** Страница глобального вида договора: все поля и правка подписей/текстов. */
export function ContractDetail({ id }: { id: number }) {
    const detail = useContractDetail(id);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{detail.heading}</h1>
                    <p className="text-sm text-muted-foreground">
                        Глобальный вид договора — общий для всех порталов.
                    </p>
                </div>
                <div className="flex gap-2">
                    {detail.contract ? (
                        <Button onClick={() => detail.setEditing(true)}>
                            <Pencil aria-hidden />
                            Редактировать
                        </Button>
                    ) : null}
                    <Button asChild variant="outline">
                        <Link href="/konstructor/contract">← К списку</Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Все поля</CardTitle>
                </CardHeader>
                <CardContent>
                    {detail.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : detail.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось загрузить договор.
                        </p>
                    ) : (
                        <FieldList rows={detail.rows} />
                    )}
                </CardContent>
            </Card>

            {detail.contract ? (
                <ContractEditDialog
                    contract={detail.contract}
                    open={detail.editing}
                    onOpenChange={detail.setEditing}
                />
            ) : null}
        </div>
    );
}
