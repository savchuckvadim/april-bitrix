'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePortal } from '@/modules/entities/portal/hooks';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import {
    useCreatePortalContract,
    useDeletePortalContract,
    usePortalContractForm,
    usePortalContracts,
} from '../../lib/hooks';
import type { ContractTypeItemOption, SelectOption } from '../../model';
import { ContractMappingForm } from '../ContractMappingForm';

/** Лейбл опции связи по id (или прочерк). */
function optionLabel(
    options: (SelectOption | ContractTypeItemOption)[] | undefined,
    id: number,
): React.ReactNode {
    const found = options?.find((o) => o.id === id);
    if (!found) return <span className="text-muted-foreground">#{id}</span>;
    return found.title || found.name;
}

/**
 * Панель договоров портала: список `portal_contracts` со связями (развёрнутыми в
 * подписи через initial-данные формы), создание через диалог с селектами и
 * удаление. Портал определяется по `domain` (резолвится из `portalId`).
 */
export function PortalContractsPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const contracts = usePortalContracts(domain);
    const form = usePortalContractForm(domain);
    const createContract = useCreatePortalContract();
    const deleteContract = useDeletePortalContract();

    const [createOpen, setCreateOpen] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — данные недоступны.
            </p>
        );
    }

    const rows = contracts.data ?? [];

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Договоры портала</h1>
                    <p className="text-sm text-muted-foreground">
                        Портал: {domain ?? '…'}
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} disabled={!domain}>
                    Добавить договор
                </Button>
            </div>
            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Договоры портала</CardTitle>
                </CardHeader>
                <CardContent>
                    {contracts.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : rows.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            У портала нет настроенных договоров — добавьте первый.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">ID</TableHead>
                                        <TableHead>Заголовок</TableHead>
                                        <TableHead>Вид договора</TableHead>
                                        <TableHead>Единица измерения</TableHead>
                                        <TableHead>Тип сделки (item)</TableHead>
                                        <TableHead className="w-20">Порядок</TableHead>
                                        <TableHead className="w-28">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-mono text-xs">
                                                <Link
                                                    href={`/portal/${portalId}/konstructor/contract/${row.id}`}
                                                    className="text-primary underline"
                                                >
                                                    {row.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/portal/${portalId}/konstructor/contract/${row.id}`}
                                                    className="text-primary underline"
                                                >
                                                    {row.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {optionLabel(
                                                    form.data?.contracts,
                                                    row.contract_id,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {optionLabel(
                                                    form.data?.portalMeasures,
                                                    row.portal_measure_id,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {optionLabel(
                                                    form.data?.contractTypeItems,
                                                    row.bitrixfield_item_id,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {row.order ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive"
                                                    disabled={deleteContract.isPending}
                                                    onClick={() => {
                                                        setNotice(null);
                                                        deleteContract.mutate(row.id, {
                                                            onError: (e) =>
                                                                setNotice(
                                                                    getApiErrorMessage(e),
                                                                ),
                                                        });
                                                    }}
                                                >
                                                    Удалить
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Новый договор портала</DialogTitle>
                    </DialogHeader>
                    <ContractMappingForm
                        form={form.data}
                        submitting={createContract.isPending}
                        submitLabel="Создать"
                        onCancel={() => setCreateOpen(false)}
                        onSubmit={(values) => {
                            if (!domain) return;
                            setNotice(null);
                            createContract.mutate(
                                { domain, dto: values },
                                {
                                    onSuccess: () => {
                                        setCreateOpen(false);
                                        setNotice('Договор создан.');
                                    },
                                    onError: (e) => setNotice(getApiErrorMessage(e)),
                                },
                            );
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
