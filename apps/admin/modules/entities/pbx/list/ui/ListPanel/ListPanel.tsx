'use client';

import * as React from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { JsonView } from '../../../lib/ui';
import { ListsTable } from '../ListsTable';
import { ListFieldsTable } from '../ListFieldsTable';
import { TemplatePanel } from '../TemplatePanel';
import { DbListsPanel } from '../DbListsPanel';
import type { ItemMatrixRow } from '../../lib/items-matrix';
import {
    useDeleteList,
    useDeleteListFieldItem,
    useDeleteListFields,
    useEditListFieldItem,
    useInstallAllLists,
    useInstallList,
    useInstallListFields,
    useListMonitoring,
    useListParse,
    usePortalLists,
} from '../../lib/hooks';
import type {
    ListFieldItemResult,
    ListFieldRow,
    ListRow,
} from '../../model';

type PendingDelete =
    | { kind: 'list'; row: ListRow }
    | { kind: 'field'; list: ListRow; row: ListFieldRow }
    | null;

type PendingItem =
    | {
          kind: 'edit';
          list: ListRow;
          field: ListFieldRow;
          item: ItemMatrixRow;
          value: string;
      }
    | { kind: 'delete'; list: ListRow; field: ListFieldRow; item: ItemMatrixRow }
    | null;

/** Группа списка в типе, который принимают list-эндпоинты. */
const listGroupOf = (row: ListRow) =>
    row.group as 'sales' | 'service' | 'general';

/** Текущее отображаемое значение item-а (БД в приоритете). */
const itemValueOf = (item: ItemMatrixRow) =>
    item.db?.name ?? item.bitrix?.value ?? item.template?.value ?? '';

/** Сводка пер-портального результата item-операции для notice. */
const itemResultNotice = (results: ListFieldItemResult[]) => {
    const failed = results.filter((r) => !r.bx.ok || !r.db.ok);
    if (failed.length === 0) return null;
    return failed
        .map(
            (r) =>
                `${r.domain}: ${[
                    !r.bx.ok && `Bitrix — ${r.bx.error ?? 'ошибка'}`,
                    !r.db.ok && `БД — ${r.db.error ?? 'ошибка'}`,
                ]
                    .filter(Boolean)
                    .join('; ')}`,
        )
        .join(' · ');
};

export function ListPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const monitoring = useListMonitoring(domain);
    const parse = useListParse();
    const portalDb = usePortalLists(domain);
    const installAll = useInstallAllLists();
    const installList = useInstallList();
    const installFields = useInstallListFields();
    const deleteList = useDeleteList();
    const deleteFields = useDeleteListFields();
    const editItem = useEditListFieldItem();
    const deleteItem = useDeleteListFieldItem();

    const [notice, setNotice] = React.useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [pending, setPending] = React.useState<PendingDelete>(null);
    const [pendingItem, setPendingItem] = React.useState<PendingItem>(null);
    const [withBitrix, setWithBitrix] = React.useState(false);

    const lists = monitoring.data?.lists ?? [];
    const itemsBusy = editItem.isPending || deleteItem.isPending;

    const runInstall = () => {
        if (!domain) return;
        setNotice(null);
        installAll.mutate(domain, {
            onSuccess: (res) => {
                setPreviewOpen(false);
                setNotice(`Эталон установлен: списков ${res.installed.length}.`);
            },
            onError: (e) =>
                setNotice(
                    `Ошибка установки: ${e instanceof Error ? e.message : 'неизвестно'}`,
                ),
        });
    };

    /** Эталонный шаблон списка (из parse) для строки мониторинга. */
    const listTemplateFor = (row: ListRow) =>
        parse.data?.lists.find(
            (l) => l.type === row.type && l.group === row.group,
        );

    /** Точечно выровнять один список (инфоблок + поля + зеркало в БД). */
    const syncList = (row: ListRow) => {
        if (!domain) return;
        setNotice(null);
        installList.mutate(
            { domain, row },
            {
                onSuccess: () =>
                    setNotice(`Список «${row.name}» синхронизирован.`),
                onError: (e) =>
                    setNotice(
                        `Не удалось синхронизировать «${row.name}»: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    /** Точечно выровнять одно поле списка по эталону. */
    const syncField = (list: ListRow, row: ListFieldRow) => {
        if (!domain) return;
        const template = listTemplateFor(list)?.fields.find(
            (f) => f.code === row.code,
        );
        if (!template) return;
        setNotice(null);
        installFields.mutate(
            {
                domain,
                list: { type: list.type, group: listGroupOf(list) },
                fields: [template],
            },
            {
                onSuccess: () =>
                    setNotice(`Поле «${row.name}» синхронизировано.`),
                onError: (e) =>
                    setNotice(
                        `Не удалось синхронизировать «${row.name}»: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    const confirmDelete = () => {
        if (!domain || !pending) return;
        setNotice(null);
        if (pending.kind === 'list') {
            const { row } = pending;
            deleteList.mutate(
                {
                    domain,
                    list: { type: row.type, group: listGroupOf(row) },
                    withBitrix,
                },
                {
                    onSuccess: () => setNotice(`Список «${row.name}» удалён.`),
                    onError: (e) =>
                        setNotice(
                            `Не удалось удалить «${row.name}»: ${
                                e instanceof Error ? e.message : 'ошибка'
                            }`,
                        ),
                    onSettled: () => setPending(null),
                },
            );
        } else {
            const { list, row } = pending;
            deleteFields.mutate(
                {
                    domain,
                    list: { type: list.type, group: listGroupOf(list) },
                    codes: [row.code],
                },
                {
                    onSuccess: () => setNotice(`Поле «${row.name}» удалено.`),
                    onError: (e) =>
                        setNotice(
                            `Не удалось удалить «${row.name}»: ${
                                e instanceof Error ? e.message : 'ошибка'
                            }`,
                        ),
                    onSettled: () => setPending(null),
                },
            );
        }
    };

    /** Подтвердить точечную операцию над значением enum-поля. */
    const confirmItem = () => {
        if (!domain || !pendingItem) return;
        const { list, field, item } = pendingItem;
        if (!item.code) return;
        const base = {
            domain,
            fieldCode: field.code,
            itemCode: item.code,
            type: list.type,
            group: listGroupOf(list),
        };
        setNotice(null);
        if (pendingItem.kind === 'edit') {
            editItem.mutate(
                { ...base, newValue: pendingItem.value.trim() },
                {
                    onSuccess: (res) =>
                        setNotice(
                            itemResultNotice(res) ??
                                `Значение «${item.code}» переименовано.`,
                        ),
                    onError: (e) =>
                        setNotice(
                            `Не удалось переименовать значение: ${
                                e instanceof Error ? e.message : 'ошибка'
                            }`,
                        ),
                    onSettled: () => setPendingItem(null),
                },
            );
        } else {
            deleteItem.mutate(base, {
                onSuccess: (res) =>
                    setNotice(
                        itemResultNotice(res) ??
                            `Значение «${item.code}» удалено.`,
                    ),
                onError: (e) =>
                    setNotice(
                        `Не удалось удалить значение: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
                onSettled: () => setPendingItem(null),
            });
        }
    };

    /** Сколько списков/полей рассинхронизировано с эталоном. */
    const listsOutOfSync = lists.filter((l) => !l.inSync).length;
    const fieldsOutOfSync = lists.reduce(
        (acc, l) => acc + l.fields.filter((f) => !f.inSync).length,
        0,
    );
    const hasDrift = listsOutOfSync + fieldsOutOfSync > 0;

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — работа со списками недоступна.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Списки</h1>
                    <p className="text-sm text-muted-foreground">
                        Портал: {domain ?? '…'}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Button
                        onClick={() => setPreviewOpen(true)}
                        disabled={!domain || installAll.isPending}
                    >
                        {installAll.isPending
                            ? 'Установка…'
                            : hasDrift
                              ? 'Выровнять всё по эталону'
                              : 'Установить эталон'}
                    </Button>
                    {hasDrift && !monitoring.isLoading && (
                        <span className="text-xs text-amber-600">
                            Рассинхрон: списков {listsOutOfSync}, полей{' '}
                            {fieldsOutOfSync}
                        </span>
                    )}
                </div>
            </div>

            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Состояние списков</CardTitle>
                    <CardDescription className="space-y-2">
                        <span className="block">
                            <b>Списки</b> — универсальные списки Bitrix (инфоблоки), в
                            которые приложения пишут события: KPI, история работы,
                            презентации. Зеркало хранится в PortalDB (`bitrixlists`) с
                            IBLOCK_ID.
                        </span>
                        <span className="block">
                            <b>Поля</b> — свойства инфоблока. Интеграции (KPI-отчёты,
                            история) находят их через зеркало в `bitrixfields` по
                            FIELD_ID (PROPERTY_N), поэтому важна синхронизация.
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {monitoring.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : (
                        <Tabs defaultValue="lists" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="lists">
                                    Списки ({lists.length})
                                    {listsOutOfSync > 0 && (
                                        <span className="ml-1 text-amber-600">
                                            ⚠ {listsOutOfSync}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="fields">
                                    Поля
                                    {fieldsOutOfSync > 0 && (
                                        <span className="ml-1 text-amber-600">
                                            ⚠ {fieldsOutOfSync}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="template">
                                    Эталон ({parse.data?.lists.length ?? '…'})
                                </TabsTrigger>
                                <TabsTrigger value="db">
                                    PortalDB ({portalDb.data?.lists.length ?? '…'})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="lists">
                                <ListsTable
                                    rows={lists}
                                    syncing={installList.isPending}
                                    deleting={deleteList.isPending}
                                    onSync={syncList}
                                    onDelete={(row) => {
                                        setWithBitrix(false);
                                        setPending({ kind: 'list', row });
                                    }}
                                />
                            </TabsContent>
                            <TabsContent value="fields" className="space-y-6">
                                {lists.map((list) => (
                                    <div
                                        key={`${list.group}_${list.type}`}
                                        className="space-y-2"
                                    >
                                        <p className="font-medium">
                                            {list.name}{' '}
                                            <span className="font-mono text-xs text-muted-foreground">
                                                ({list.type} / {list.group})
                                            </span>
                                        </p>
                                        <ListFieldsTable
                                            rows={list.fields}
                                            syncing={installFields.isPending}
                                            deleting={deleteFields.isPending}
                                            itemsBusy={itemsBusy}
                                            canSync={(row) =>
                                                !!listTemplateFor(list)?.fields.some(
                                                    (f) => f.code === row.code,
                                                )
                                            }
                                            onSync={(row) => syncField(list, row)}
                                            onDelete={(row) =>
                                                setPending({
                                                    kind: 'field',
                                                    list,
                                                    row,
                                                })
                                            }
                                            onEditItem={(row, item) =>
                                                setPendingItem({
                                                    kind: 'edit',
                                                    list,
                                                    field: row,
                                                    item,
                                                    value: itemValueOf(item),
                                                })
                                            }
                                            onDeleteItem={(row, item) =>
                                                setPendingItem({
                                                    kind: 'delete',
                                                    list,
                                                    field: row,
                                                    item,
                                                })
                                            }
                                        />
                                    </div>
                                ))}
                            </TabsContent>
                            <TabsContent value="template">
                                <TemplatePanel
                                    data={parse.data}
                                    loading={parse.isLoading}
                                />
                            </TabsContent>
                            <TabsContent value="db">
                                <DbListsPanel
                                    data={portalDb.data}
                                    loading={portalDb.isLoading}
                                />
                            </TabsContent>
                        </Tabs>
                    )}

                    <Accordion type="single" collapsible className="mt-4">
                        <AccordionItem value="raw">
                            <AccordionTrigger className="text-sm">
                                Сырой ответ мониторинга
                            </AccordionTrigger>
                            <AccordionContent>
                                <JsonView data={monitoring.data} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            {/* Предпросмотр эталона перед установкой */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Установить эталон списков</DialogTitle>
                        <DialogDescription>
                            Будут установлены списки ниже (идемпотентно — существующие
                            инфоблоки и поля обновятся). Зеркало пишется в
                            `bitrixlists` и `bitrixfields`.
                        </DialogDescription>
                    </DialogHeader>

                    {parse.isLoading ? (
                        <p className="text-sm text-muted-foreground">
                            Загрузка эталона…
                        </p>
                    ) : (
                        <div className="max-h-[50vh] space-y-3 overflow-auto text-sm">
                            {parse.data?.lists.map((list) => (
                                <div key={`${list.group}_${list.type}`}>
                                    <p className="font-medium">
                                        {list.name}{' '}
                                        <span className="font-mono text-xs">
                                            ({list.type} / {list.group})
                                        </span>{' '}
                                        — полей: {list.fields.length}
                                    </p>
                                    <ul className="ml-4 list-disc text-muted-foreground">
                                        {list.fields.map((f) => (
                                            <li key={f.code}>
                                                {f.name}{' '}
                                                <span className="font-mono text-xs">
                                                    ({f.bxFieldName})
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPreviewOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={runInstall}
                            disabled={installAll.isPending || !domain}
                        >
                            {installAll.isPending ? 'Установка…' : 'Установить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Подтверждение удаления списка/поля */}
            <Dialog
                open={pending !== null}
                onOpenChange={(open) => !open && setPending(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {pending?.kind === 'list'
                                ? 'Удалить список?'
                                : 'Удалить поле?'}
                        </DialogTitle>
                        <DialogDescription>
                            {pending?.kind === 'list'
                                ? `Зеркало списка «${pending.row.name}» будет удалено из PortalDB (строка bitrixlists и её поля).`
                                : pending
                                  ? `Поле «${pending.row.name}» будет удалено в Bitrix и в PortalDB.`
                                  : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {pending?.kind === 'list' && (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="with-bitrix"
                                checked={withBitrix}
                                onCheckedChange={(v) => setWithBitrix(v === true)}
                            />
                            <Label htmlFor="with-bitrix" className="text-sm">
                                Удалить также инфоблок в Bitrix (вместе с данными
                                списка!)
                            </Label>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPending(null)}>
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={
                                deleteList.isPending || deleteFields.isPending
                            }
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Точечная операция над значением enum-поля */}
            <Dialog
                open={pendingItem !== null}
                onOpenChange={(open) => !open && setPendingItem(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {pendingItem?.kind === 'edit'
                                ? 'Переименовать значение'
                                : 'Удалить значение?'}
                        </DialogTitle>
                        <DialogDescription>
                            {pendingItem
                                ? pendingItem.kind === 'edit'
                                    ? `Поле «${pendingItem.field.name}», значение «${
                                          pendingItem.item.code ?? ''
                                      }». Новое название запишется в Bitrix (VALUE) и в PortalDB; code останется прежним.`
                                    : `Значение «${itemValueOf(pendingItem.item)}» (${
                                          pendingItem.item.code ?? ''
                                      }) поля «${pendingItem.field.name}» будет удалено в Bitrix и в PortalDB.`
                                : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {pendingItem?.kind === 'edit' && (
                        <div className="space-y-2">
                            <Label htmlFor="item-value" className="text-sm">
                                Новое значение
                            </Label>
                            <Input
                                id="item-value"
                                value={pendingItem.value}
                                onChange={(e) =>
                                    setPendingItem({
                                        ...pendingItem,
                                        value: e.target.value,
                                    })
                                }
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPendingItem(null)}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant={
                                pendingItem?.kind === 'delete'
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={confirmItem}
                            disabled={
                                itemsBusy ||
                                (pendingItem?.kind === 'edit' &&
                                    !pendingItem.value.trim())
                            }
                        >
                            {pendingItem?.kind === 'edit'
                                ? 'Переименовать'
                                : 'Удалить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
