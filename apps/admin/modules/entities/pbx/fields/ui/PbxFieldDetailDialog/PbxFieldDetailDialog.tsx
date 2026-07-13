'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { ConfirmDialog } from '@/modules/shared/ui';
import { PresenceBadge } from '../../../lib/ui';
import { futureApiMessage, type SingleStoreTarget } from '../../../lib/future-api';
import type {
    PbxFieldCompareRow,
    PbxNormalizedItem,
} from '../../../lib/model/common';

/** Scalar (non-object) entries of a representation, as a plain record. */
function scalarObj(data: unknown): Record<string, unknown> {
    if (!data || typeof data !== 'object') return {};
    return Object.fromEntries(
        Object.entries(data as Record<string, unknown>).filter(
            ([, v]) => v === null || typeof v !== 'object',
        ),
    );
}

interface RepColumn {
    label: string;
    present: boolean;
    data: unknown;
}

/**
 * Side-by-side comparison of representations: one row per property, one column
 * per source (template / Bitrix / PortalDB). Uses the full dialog width so long
 * identifiers don't wrap character-by-character.
 */
function RepTable({ cols }: { cols: RepColumn[] }) {
    const objs = cols.map((c) => scalarObj(c.data));
    const keys: string[] = [];
    for (const obj of objs) {
        for (const k of Object.keys(obj)) if (!keys.includes(k)) keys.push(k);
    }
    if (keys.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Нет данных ни в одном источнике.</p>
        );
    }
    return (
        <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b bg-muted/40">
                        <th className="p-2 text-left font-medium">Свойство</th>
                        {cols.map((c) => (
                            <th key={c.label} className="p-2 text-left font-medium">
                                <span className="inline-flex items-center gap-1">
                                    {c.label}
                                    <PresenceBadge present={c.present} />
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {keys.map((k) => (
                        <tr key={k} className="border-b align-top last:border-0">
                            <td className="p-2 text-muted-foreground">{k}</td>
                            {objs.map((obj, i) => (
                                <td
                                    key={i}
                                    className="break-words p-2 font-mono"
                                >
                                    {k in obj ? String(obj[k] ?? '—') : '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

interface PbxFieldDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    row: PbxFieldCompareRow | null;
    domain: string;
    canSync: boolean;
    onSync: () => Promise<void>;
    onEditItem: (itemCode: string, newValue: string) => Promise<void>;
    onDeleteItem: (itemCode: string) => Promise<void>;
    isPending?: boolean;
}

/**
 * Three-representation field detail: template ↔ Bitrix ↔ PortalDB. Enum items can
 * be expanded to the same tri-view. "Синхронизировать" re-installs the field from
 * its template; single-store edits are future-API stubs.
 */
export function PbxFieldDetailDialog({
    open,
    onOpenChange,
    row,
    domain,
    canSync,
    onSync,
    onEditItem,
    onDeleteItem,
    isPending,
}: PbxFieldDetailDialogProps) {
    const [notice, setNotice] = React.useState<string | null>(null);
    const [expanded, setExpanded] = React.useState<string | null>(null);
    const [editCode, setEditCode] = React.useState<string | null>(null);
    const [draft, setDraft] = React.useState('');
    const [deleteItem, setDeleteItem] = React.useState<PbxNormalizedItem | null>(
        null,
    );

    React.useEffect(() => {
        if (open) {
            setNotice(null);
            setExpanded(null);
            setEditCode(null);
        }
    }, [open, row?.code]);

    const stub = (action: string, target?: SingleStoreTarget) =>
        setNotice(futureApiMessage(action, target));

    if (!row) return null;
    const isAll = domain === 'all';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[min(1280px,95vw)] max-h-[92vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>{row.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                            {row.code}
                        </span>
                        <span className="text-xs">{row.type ?? ''}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={onSync} disabled={!canSync || isPending}>
                        Синхронизировать
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => stub('Изменить поле', 'bitrix')}
                    >
                        Изменить только в Bitrix
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => stub('Изменить поле', 'portal')}
                    >
                        Изменить только в Portal
                    </Button>
                </div>
                {notice && <p className="text-xs text-amber-600">{notice}</p>}

                <RepTable
                    cols={[
                        { label: 'Шаблон', present: row.inTemplate, data: row.template },
                        {
                            label: 'Bitrix',
                            present: row.inBitrix,
                            data: row.installed?.bitrix,
                        },
                        {
                            label: 'PortalDB',
                            present: row.inDb,
                            data: row.installed?.portal,
                        },
                    ]}
                />

                {row.items.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                            Значения списка ({row.items.length})
                        </h3>
                        {row.items.map((item) => {
                            const isOpen = expanded === item.code;
                            const isEditing = editCode === item.code;
                            return (
                                <div
                                    key={item.code}
                                    className="rounded-md border p-2 text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="w-5 text-muted-foreground"
                                            onClick={() =>
                                                setExpanded(isOpen ? null : item.code)
                                            }
                                        >
                                            {isOpen ? '▾' : '▸'}
                                        </button>
                                        <span className="w-36 shrink-0 font-mono text-xs text-muted-foreground">
                                            {item.code}
                                        </span>
                                        {isEditing ? (
                                            <Input
                                                value={draft}
                                                onChange={(e) => setDraft(e.target.value)}
                                                className="flex-1"
                                            />
                                        ) : (
                                            <span className="flex-1">{item.name}</span>
                                        )}
                                        <span className="flex items-center gap-1 text-xs">
                                            Ш <PresenceBadge present={item.inTemplate} />
                                            BX <PresenceBadge present={item.inBitrix} />
                                            БД <PresenceBadge present={item.inDb} />
                                        </span>
                                        <div className="flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        disabled={isPending}
                                                        onClick={async () => {
                                                            await onEditItem(
                                                                item.code,
                                                                draft,
                                                            );
                                                            setEditCode(null);
                                                        }}
                                                    >
                                                        Сохранить
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditCode(null)}
                                                    >
                                                        Отмена
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditCode(item.code);
                                                            setDraft(item.name);
                                                        }}
                                                    >
                                                        Изменить
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setDeleteItem(item)
                                                        }
                                                    >
                                                        Удалить
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="mt-2 space-y-2 pl-7">
                                            <RepTable
                                                cols={[
                                                    {
                                                        label: 'Шаблон',
                                                        present: item.inTemplate,
                                                        data: item.template,
                                                    },
                                                    {
                                                        label: 'Bitrix',
                                                        present: item.inBitrix,
                                                        data: item.bitrix,
                                                    },
                                                    {
                                                        label: 'PortalDB',
                                                        present: item.inDb,
                                                        data: item.portal,
                                                    },
                                                ]}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        stub('Изменить значение', 'bitrix')
                                                    }
                                                >
                                                    Изменить только в Bitrix
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        stub('Изменить значение', 'portal')
                                                    }
                                                >
                                                    Изменить только в Portal
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <ConfirmDialog
                    open={Boolean(deleteItem)}
                    onOpenChange={(o) => !o && setDeleteItem(null)}
                    title="Удалить значение?"
                    description={`Удалить «${deleteItem?.name ?? ''}» из поля ${
                        row.code
                    }?${isAll ? ' Операция затронет ВСЕ порталы.' : ''}`}
                    confirmLabel="Удалить"
                    variant="destructive"
                    onConfirm={async () => {
                        if (!deleteItem) return;
                        await onDeleteItem(deleteItem.code);
                        setDeleteItem(null);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
