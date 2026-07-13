'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/modules/entities/portal/hooks';
import { useContract } from '@/modules/entities/konstructor/contract';
import { usePortalMeasures } from '@/modules/entities/konstructor/portal-measure';
import {
    FieldList,
    formatFieldValue,
    type FieldRow,
} from '@/modules/entities/konstructor/lib';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    useDeletePortalContract,
    usePortalContractForm,
    usePortalContracts,
    useUpdatePortalContract,
} from '../../lib/hooks';
import { ContractMappingForm } from '../ContractMappingForm';

/**
 * Детали договора портала: собственные поля `portal_contracts` плюс отдельные
 * блоки по каждой связи — вид договора (`contracts`), портальная единица
 * измерения (`portal_measure`) и item поля `contract_type` сделки.
 */
export function PortalContractDetail({
    portalId,
    id,
}: {
    portalId: number;
    id: number;
}) {
    const router = useRouter();
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const contracts = usePortalContracts(domain);
    const form = usePortalContractForm(domain);
    const portalMeasures = usePortalMeasures(domain);
    const updateContract = useUpdatePortalContract();
    const deleteContract = useDeletePortalContract();

    const [editing, setEditing] = React.useState(false);
    const [notice, setNotice] = React.useState<string | null>(null);

    const contract = React.useMemo(
        () => (contracts.data ?? []).find((c) => c.id === id),
        [contracts.data, id],
    );

    const globalContract = useContract(contract?.contract_id);

    const portalMeasure = React.useMemo(
        () =>
            (portalMeasures.data ?? []).find(
                (m) => m.id === contract?.portal_measure_id,
            ),
        [portalMeasures.data, contract?.portal_measure_id],
    );

    const typeItem = React.useMemo(
        () =>
            form.data?.contractTypeItems.find(
                (t) => t.id === contract?.bitrixfield_item_id,
            ),
        [form.data, contract?.bitrixfield_item_id],
    );

    const base = `/portal/${portalId}/konstructor/contract`;

    const ownRows: FieldRow[] = contract
        ? [
              { label: 'ID', value: formatFieldValue(contract.id) },
              { label: 'Заголовок', value: formatFieldValue(contract.title) },
              { label: 'Шаблон', value: formatFieldValue(contract.template) },
              { label: 'Порядок', value: formatFieldValue(contract.order) },
              {
                  label: 'Наименование продукта',
                  value: formatFieldValue(contract.productName),
              },
              { label: 'Описание', value: formatFieldValue(contract.description) },
              { label: 'ID портала', value: formatFieldValue(contract.portal_id) },
              {
                  label: 'ID вида договора',
                  value: formatFieldValue(contract.contract_id),
              },
              {
                  label: 'ID ед. измерения',
                  value: formatFieldValue(contract.portal_measure_id),
              },
              {
                  label: 'ID item типа сделки',
                  value: formatFieldValue(contract.bitrixfield_item_id),
              },
          ]
        : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">
                        {contract?.title || `Договор портала #${id}`}
                    </h1>
                    <p className="text-sm text-muted-foreground">Портал: {domain ?? '…'}</p>
                </div>
                <div className="flex gap-2">
                    {contract && !editing && (
                        <Button variant="outline" onClick={() => setEditing(true)}>
                            Редактировать
                        </Button>
                    )}
                    {contract && (
                        <Button
                            variant="destructive"
                            disabled={deleteContract.isPending}
                            onClick={() => {
                                setNotice(null);
                                deleteContract.mutate(contract.id, {
                                    onSuccess: () => router.push(base),
                                    onError: (e) => setNotice(getApiErrorMessage(e)),
                                });
                            }}
                        >
                            Удалить
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href={base}>← К списку</Link>
                    </Button>
                </div>
            </div>
            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            {contract && editing && (
                <Card>
                    <CardHeader>
                        <CardTitle>Редактирование договора</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ContractMappingForm
                            form={form.data}
                            initial={contract}
                            submitting={updateContract.isPending}
                            submitLabel="Сохранить"
                            onCancel={() => setEditing(false)}
                            onSubmit={(values) => {
                                setNotice(null);
                                updateContract.mutate(
                                    { id: contract.id, dto: values },
                                    {
                                        onSuccess: () => {
                                            setEditing(false);
                                            setNotice('Изменения сохранены.');
                                        },
                                        onError: (e) =>
                                            setNotice(getApiErrorMessage(e)),
                                    },
                                );
                            }}
                        />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Договор портала</CardTitle>
                </CardHeader>
                <CardContent>
                    {contracts.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !contract ? (
                        <p className="text-sm text-muted-foreground">
                            Договор #{id} не найден у портала.
                        </p>
                    ) : (
                        <FieldList rows={ownRows} />
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Связь: вид договора (глобальный)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {!contract ? (
                        <p className="text-sm text-muted-foreground">—</p>
                    ) : globalContract.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !globalContract.data ? (
                        <p className="text-sm text-muted-foreground">
                            Вид договора #{contract.contract_id} недоступен.
                        </p>
                    ) : (
                        <>
                            <FieldList
                                rows={[
                                    {
                                        label: 'Наименование',
                                        value: formatFieldValue(globalContract.data.name),
                                    },
                                    {
                                        label: 'Заголовок',
                                        value: formatFieldValue(globalContract.data.title),
                                    },
                                    {
                                        label: 'Код',
                                        value: formatFieldValue(globalContract.data.code),
                                    },
                                    {
                                        label: 'Тип',
                                        value: formatFieldValue(globalContract.data.type),
                                    },
                                    {
                                        label: 'С предоплатой',
                                        value: formatFieldValue(
                                            globalContract.data.withPrepayment,
                                        ),
                                    },
                                ]}
                            />
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={`/konstructor/contract/${contract.contract_id}`}
                                >
                                    Открыть вид договора →
                                </Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Связь: единица измерения (портальная)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {!contract ? (
                        <p className="text-sm text-muted-foreground">—</p>
                    ) : portalMeasures.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !portalMeasure ? (
                        <p className="text-sm text-muted-foreground">
                            Единица измерения #{contract.portal_measure_id} недоступна.
                        </p>
                    ) : (
                        <>
                            <FieldList
                                rows={[
                                    {
                                        label: 'Наименование',
                                        value: formatFieldValue(portalMeasure.name),
                                    },
                                    {
                                        label: 'Краткое',
                                        value: formatFieldValue(portalMeasure.shortName),
                                    },
                                    {
                                        label: 'Полное',
                                        value: formatFieldValue(portalMeasure.fullName),
                                    },
                                    {
                                        label: 'Bitrix ID',
                                        value: formatFieldValue(portalMeasure.bitrixId),
                                    },
                                ]}
                            />
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={`/portal/${portalId}/konstructor/measure/${portalMeasure.id}`}
                                >
                                    Открыть единицу измерения →
                                </Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Связь: тип сделки (item поля contract_type)</CardTitle>
                </CardHeader>
                <CardContent>
                    {!contract ? (
                        <p className="text-sm text-muted-foreground">—</p>
                    ) : form.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : !typeItem ? (
                        <p className="text-sm text-muted-foreground">
                            Item #{contract.bitrixfield_item_id} недоступен.
                        </p>
                    ) : (
                        <FieldList
                            rows={[
                                {
                                    label: 'Подпись',
                                    value: formatFieldValue(typeItem.title),
                                },
                                {
                                    label: 'Наименование',
                                    value: formatFieldValue(typeItem.name),
                                },
                                { label: 'Код', value: formatFieldValue(typeItem.code) },
                                {
                                    label: 'Bitrix ID',
                                    value: formatFieldValue(typeItem.bitrixId),
                                },
                            ]}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
