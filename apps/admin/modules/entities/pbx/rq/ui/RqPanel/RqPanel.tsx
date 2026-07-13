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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs';
import { JsonView } from '../../../lib/ui';
import { RqPresetsTable } from '../RqPresetsTable';
import { RqFieldsTable } from '../RqFieldsTable';
import {
    useDeleteRqFields,
    useDeleteRqPresets,
    useInstallRqAll,
    useInstallRqFields,
    useInstallRqPresets,
    useRqMonitoring,
    useRqParse,
    useSetRqPresetBitrixId,
} from '../../lib/hooks';
import type { RqFieldRow, RqPresetCode, RqPresetRow } from '../../model';

type PendingDelete =
    | { kind: 'preset'; id: number; label: string }
    | { kind: 'field'; id: number; label: string }
    | null;

export function RqPanel({ portalId }: { portalId: number }) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const monitoring = useRqMonitoring(domain);
    const parse = useRqParse();
    const installAll = useInstallRqAll();
    const installFields = useInstallRqFields();
    const installPresets = useInstallRqPresets();
    const deletePresets = useDeleteRqPresets();
    const deleteFields = useDeleteRqFields();
    const setPresetBitrixId = useSetRqPresetBitrixId();

    const [notice, setNotice] = React.useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = React.useState(false);
    const [pending, setPending] = React.useState<PendingDelete>(null);

    const presets = monitoring.data?.presets ?? [];
    const fields = monitoring.data?.fields ?? [];

    const runInstall = () => {
        if (!domain) return;
        setNotice(null);
        installAll.mutate(domain, {
            onSuccess: (res) => {
                setPreviewOpen(false);
                setNotice(
                    `Эталон установлен: пресетов ${res.presets.length}, полей ${res.fields.length}.`,
                );
            },
            onError: (e) =>
                setNotice(
                    `Ошибка установки: ${e instanceof Error ? e.message : 'неизвестно'}`,
                ),
        });
    };

    const confirmDelete = () => {
        if (!domain || !pending) return;
        const { kind, id, label } = pending;
        setNotice(null);
        const onDone = {
            onSuccess: () => setNotice(`«${label}» удалён в Bitrix.`),
            onError: (e: unknown) =>
                setNotice(
                    `Не удалось удалить «${label}»: ${
                        e instanceof Error ? e.message : 'ошибка'
                    }`,
                ),
            onSettled: () => setPending(null),
        };
        if (kind === 'preset')
            deletePresets.mutate({ domain, ids: [id] }, onDone);
        else deleteFields.mutate({ domain, ids: [id] }, onDone);
    };

    /** Эталонный шаблон поля по xmlId (из parse). */
    const fieldTemplateFor = (row: RqFieldRow) =>
        parse.data?.fields.find((f) => f.xmlId === row.xmlId);

    /** Эталонный шаблон пресета по xmlId (из parse). */
    const presetTemplateFor = (row: RqPresetRow) =>
        parse.data?.presets.find((p) => p.xmlId === row.xmlId);

    /** Точечно создать одно недостающее поле в Bitrix по эталону. */
    const syncField = (row: RqFieldRow) => {
        if (!domain) return;
        const template = fieldTemplateFor(row);
        if (!template) return;
        setNotice(null);
        installFields.mutate(
            { domain, fields: [template] },
            {
                onSuccess: () =>
                    setNotice(`Поле «${row.label}» синхронизировано в Bitrix.`),
                onError: (e) =>
                    setNotice(
                        `Не удалось синхронизировать «${row.label}»: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    /** Точечно выровнять один пресет (создать в Bitrix + зеркало в `bx_rqs`). */
    const syncPreset = (row: RqPresetRow) => {
        if (!domain) return;
        const template = presetTemplateFor(row);
        if (!template) return;
        setNotice(null);
        installPresets.mutate(
            { domain, presets: [template] },
            {
                onSuccess: () =>
                    setNotice(`Пресет «${row.name}» синхронизирован.`),
                onError: (e) =>
                    setNotice(
                        `Не удалось синхронизировать «${row.name}»: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    /** Вручную привязать bitrixId к строке `bx_rqs` (Bitrix не меняется). */
    const setBitrixId = (row: RqPresetRow, bitrixId: number) => {
        if (!domain) return;
        setNotice(null);
        setPresetBitrixId.mutate(
            { domain, code: row.code as RqPresetCode, bitrixId },
            {
                onSuccess: () =>
                    setNotice(
                        `Пресету «${row.name}» привязан Bitrix ID ${bitrixId}.`,
                    ),
                onError: (e) =>
                    setNotice(
                        `Не удалось привязать Bitrix ID для «${row.name}»: ${
                            e instanceof Error ? e.message : 'ошибка'
                        }`,
                    ),
            },
        );
    };

    /** Сколько строк рассинхронизировано с эталоном. */
    const presetsOutOfSync = presets.filter((p) => !p.inSync).length;
    const fieldsOutOfSync = fields.filter((f) => !f.inBitrix).length;
    const hasDrift = presetsOutOfSync + fieldsOutOfSync > 0;

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — работа с реквизитами недоступна.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Реквизиты</h1>
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
                            Рассинхрон: пресетов {presetsOutOfSync}, полей{' '}
                            {fieldsOutOfSync}
                        </span>
                    )}
                </div>
            </div>

            {notice && <p className="text-xs text-amber-600">{notice}</p>}

            <Card>
                <CardHeader>
                    <CardTitle>Состояние реквизитов</CardTitle>
                    <CardDescription className="space-y-2">
                        <span className="block">
                            <b>Пресеты</b> — шаблоны набора полей реквизита (Организация /
                            ИП / Физлицо). Пресет хранится в нашей БД (`bx_rqs`) с
                            bitrix-id и помечен бизнес-кодом (типом).
                        </span>
                        <span className="block">
                            <b>Поля</b> — пользовательские поля реквизита, нужные в
                            определённом виде для договоров (например должность директора
                            в родительном падеже).
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {monitoring.isLoading ? (
                        <p className="text-sm text-muted-foreground">Загрузка…</p>
                    ) : (
                        <Tabs defaultValue="presets" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="presets">
                                    Пресеты ({presets.length})
                                    {presetsOutOfSync > 0 && (
                                        <span className="ml-1 text-amber-600">
                                            ⚠ {presetsOutOfSync}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="fields">
                                    Поля ({fields.length})
                                    {fieldsOutOfSync > 0 && (
                                        <span className="ml-1 text-amber-600">
                                            ⚠ {fieldsOutOfSync}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="presets">
                                <RqPresetsTable
                                    rows={presets}
                                    deleting={deletePresets.isPending}
                                    syncing={installPresets.isPending}
                                    settingBitrixId={
                                        setPresetBitrixId.isPending
                                    }
                                    onSetBitrixId={setBitrixId}
                                    canSync={(row: RqPresetRow) =>
                                        !!presetTemplateFor(row)
                                    }
                                    onSync={syncPreset}
                                    onDelete={(row: RqPresetRow) =>
                                        row.bitrixId &&
                                        setPending({
                                            kind: 'preset',
                                            id: row.bitrixId,
                                            label: row.name,
                                        })
                                    }
                                />
                            </TabsContent>
                            <TabsContent value="fields">
                                <RqFieldsTable
                                    rows={fields}
                                    deleting={deleteFields.isPending}
                                    syncing={installFields.isPending}
                                    canSync={(row: RqFieldRow) =>
                                        !!fieldTemplateFor(row)
                                    }
                                    onSync={syncField}
                                    onDelete={(row: RqFieldRow) =>
                                        row.fieldId &&
                                        setPending({
                                            kind: 'field',
                                            id: row.fieldId,
                                            label: row.label,
                                        })
                                    }
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
                        <DialogTitle>Установить эталон реквизитов</DialogTitle>
                        <DialogDescription>
                            Будут установлены пресеты и поля ниже (идемпотентно —
                            существующее обновится). Зеркало пресетов пишется в `bx_rqs`.
                        </DialogDescription>
                    </DialogHeader>

                    {parse.isLoading ? (
                        <p className="text-sm text-muted-foreground">
                            Загрузка эталона…
                        </p>
                    ) : (
                        <div className="max-h-[50vh] space-y-3 overflow-auto text-sm">
                            <div>
                                <p className="font-medium">
                                    Пресеты ({parse.data?.presets.length ?? 0})
                                </p>
                                <ul className="ml-4 list-disc text-muted-foreground">
                                    {parse.data?.presets.map((p) => (
                                        <li key={p.xmlId}>
                                            {p.name}{' '}
                                            <span className="font-mono text-xs">
                                                ({p.code})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium">
                                    Поля ({parse.data?.fields.length ?? 0})
                                </p>
                                <ul className="ml-4 list-disc text-muted-foreground">
                                    {parse.data?.fields.map((f) => (
                                        <li key={f.xmlId}>
                                            {f.label}{' '}
                                            <span className="font-mono text-xs">
                                                ({f.xmlId})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
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
                        <DialogTitle>Удалить в Bitrix?</DialogTitle>
                        <DialogDescription>
                            {pending?.kind === 'preset'
                                ? `Пресет «${pending?.label}» будет удалён в Bitrix (зеркало в БД останется).`
                                : `Поле «${pending?.label}» будет удалено в Bitrix.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPending(null)}>
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={
                                deletePresets.isPending || deleteFields.isPending
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
