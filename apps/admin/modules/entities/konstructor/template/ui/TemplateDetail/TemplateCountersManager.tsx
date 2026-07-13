'use client';

import * as React from 'react';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { Counter } from '@/modules/entities/konstructor/counter';
import {
    useAttachTemplateCounter,
    useDetachTemplateCounter,
    useUpdateTemplateCounter,
} from '../../lib/hooks';
import type { TemplateCounterItem, TemplateCounterUpsert } from '../../model';

interface PivotDraft {
    value: string;
    prefix: string;
    day: boolean;
    month: boolean;
    year: boolean;
    count: string;
    size: string;
}

const EMPTY_PIVOT: PivotDraft = {
    value: '',
    prefix: '',
    day: false,
    month: false,
    year: false,
    count: '0',
    size: '1',
};

function toUpsert(p: PivotDraft): TemplateCounterUpsert {
    return {
        value: p.value.trim() || undefined,
        prefix: p.prefix.trim() || undefined,
        day: p.day,
        month: p.month,
        year: p.year,
        count: p.count ? Number(p.count) : undefined,
        size: p.size ? Number(p.size) : undefined,
    };
}

function PivotFields({
    draft,
    onChange,
}: {
    draft: PivotDraft;
    onChange: (d: PivotDraft) => void;
}) {
    return (
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                    <Label>Префикс</Label>
                    <Input
                        value={draft.prefix}
                        onChange={(e) => onChange({ ...draft, prefix: e.target.value })}
                        placeholder="INV"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Значение</Label>
                    <Input
                        value={draft.value}
                        onChange={(e) => onChange({ ...draft, value: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Счётчик (count)</Label>
                    <Input
                        type="number"
                        value={draft.count}
                        onChange={(e) => onChange({ ...draft, count: e.target.value })}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Размер (size)</Label>
                    <Input
                        type="number"
                        value={draft.size}
                        onChange={(e) => onChange({ ...draft, size: e.target.value })}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                {(['day', 'month', 'year'] as const).map((k) => (
                    <label
                        key={k}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                        <Checkbox
                            checked={draft[k]}
                            onCheckedChange={(v) =>
                                onChange({ ...draft, [k]: v === true })
                            }
                        />
                        {k === 'day' ? 'День' : k === 'month' ? 'Месяц' : 'Год'}
                    </label>
                ))}
            </div>
        </div>
    );
}

interface TemplateCountersManagerProps {
    templateId: number;
    attached: TemplateCounterItem[];
    allCounters: Counter[];
    onNotice: (msg: string | null) => void;
}

/**
 * Менеджер связи «шаблон ↔ счётчик» (`template_counter`): таблица привязанных
 * счётчиков с pivot (префикс/день/месяц/год/count/size), привязка нового счётчика
 * с pivot, редактирование pivot и отвязка.
 */
export function TemplateCountersManager({
    templateId,
    attached,
    allCounters,
    onNotice,
}: TemplateCountersManagerProps) {
    const attachCounter = useAttachTemplateCounter();
    const updateCounter = useUpdateTemplateCounter();
    const detachCounter = useDetachTemplateCounter();

    const [addCounterId, setAddCounterId] = React.useState('');
    const [addPivot, setAddPivot] = React.useState<PivotDraft>({ ...EMPTY_PIVOT });
    const [editing, setEditing] = React.useState<{
        counterId: number;
        draft: PivotDraft;
    } | null>(null);

    const attachedIds = React.useMemo(
        () => new Set(attached.map((c) => c.counterId)),
        [attached],
    );
    const available = React.useMemo(
        () => allCounters.filter((c) => !attachedIds.has(c.id)),
        [allCounters, attachedIds],
    );

    const onError = (e: Error) => onNotice(getApiErrorMessage(e));

    return (
        <div className="space-y-4">
            <div className="rounded-md border p-3">
                <p className="mb-2 text-sm font-medium">Привязать счётчик</p>
                <div className="space-y-3">
                    <Select value={addCounterId} onValueChange={setAddCounterId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите счётчик" />
                        </SelectTrigger>
                        <SelectContent>
                            {available.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Все счётчики уже привязаны
                                </div>
                            ) : (
                                available.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.title} ({c.name})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <PivotFields draft={addPivot} onChange={setAddPivot} />
                    <div className="flex justify-end">
                        <Button
                            disabled={!addCounterId || attachCounter.isPending}
                            onClick={() => {
                                if (!addCounterId) return;
                                onNotice(null);
                                attachCounter.mutate(
                                    {
                                        id: templateId,
                                        counterId: Number(addCounterId),
                                        dto: toUpsert(addPivot),
                                    },
                                    {
                                        onSuccess: () => {
                                            setAddCounterId('');
                                            setAddPivot({ ...EMPTY_PIVOT });
                                        },
                                        onError,
                                    },
                                );
                            }}
                        >
                            {attachCounter.isPending ? 'Привязка…' : 'Привязать'}
                        </Button>
                    </div>
                </div>
            </div>

            {attached.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    К шаблону не привязано ни одного счётчика.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Счётчик</TableHead>
                                <TableHead>Префикс</TableHead>
                                <TableHead>Д/М/Г</TableHead>
                                <TableHead>count</TableHead>
                                <TableHead>size</TableHead>
                                <TableHead className="w-44 text-right">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attached.map((c) => (
                                <TableRow key={c.counterId}>
                                    <TableCell>
                                        {c.title || c.name || `#${c.counterId}`}
                                    </TableCell>
                                    <TableCell>{c.prefix || '—'}</TableCell>
                                    <TableCell className="space-x-1">
                                        {c.day && <Badge variant="outline">Д</Badge>}
                                        {c.month && <Badge variant="outline">М</Badge>}
                                        {c.year && <Badge variant="outline">Г</Badge>}
                                        {!c.day && !c.month && !c.year && '—'}
                                    </TableCell>
                                    <TableCell>{c.count}</TableCell>
                                    <TableCell>{c.size}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setEditing({
                                                        counterId: c.counterId,
                                                        draft: {
                                                            value: c.value ?? '',
                                                            prefix: c.prefix ?? '',
                                                            day: c.day,
                                                            month: c.month,
                                                            year: c.year,
                                                            count: String(c.count),
                                                            size: String(c.size),
                                                        },
                                                    })
                                                }
                                            >
                                                Изменить
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-destructive"
                                                disabled={detachCounter.isPending}
                                                onClick={() => {
                                                    onNotice(null);
                                                    detachCounter.mutate(
                                                        {
                                                            id: templateId,
                                                            counterId: c.counterId,
                                                        },
                                                        { onError },
                                                    );
                                                }}
                                            >
                                                Отвязать
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog
                open={!!editing}
                onOpenChange={(o) => !o && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pivot счётчика</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <div className="space-y-4">
                            <PivotFields
                                draft={editing.draft}
                                onChange={(draft) =>
                                    setEditing((e) => (e ? { ...e, draft } : e))
                                }
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditing(null)}
                                    disabled={updateCounter.isPending}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    disabled={updateCounter.isPending}
                                    onClick={() => {
                                        if (!editing) return;
                                        onNotice(null);
                                        updateCounter.mutate(
                                            {
                                                id: templateId,
                                                counterId: editing.counterId,
                                                dto: toUpsert(editing.draft),
                                            },
                                            {
                                                onSuccess: () => setEditing(null),
                                                onError,
                                            },
                                        );
                                    }}
                                >
                                    {updateCounter.isPending ? 'Сохранение…' : 'Сохранить'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
