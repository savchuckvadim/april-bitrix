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
import {
    useDeleteList,
    useDeleteListFields,
    useInstallAllLists,
    useInstallList,
    useInstallListFields,
    useListMonitoring,
    useListParse,
} from '../../lib/hooks';
import type { ListFieldRow, ListRow } from '../../model';

type PendingDelete =
    | { kind: 'list'; row: ListRow }
    | { kind: 'field'; list: ListRow; row: ListFieldRow }
    | null;

/** Группа списка в типе, который принимают list-эндпоинты. */
const listGroupOf = (row: ListRow) =>
    row.group as 'sales' | 'service' | 'general';

export function ListPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const monitoring = useListMonitoring(domain);
    const parse = useListParse();
    const installAll = useInstallAllLists();
    const installList = useInstallList();
    const installFields = useInstallListFields();
    const deleteList = useDeleteList();
    const deleteFields = useDeleteListFields();

    const [notice, setNotice] = React.useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [pending, setPending] = React.useState<PendingDelete>(null);
    const [withBitrix, setWithBitrix] = React.useState(false);

    const lists = monitoring.data?.lists ?? [];

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
                                        />
                                    </div>
                                ))}
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

            {/* Подтверждение удаления */}
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
        </div>
    );
}