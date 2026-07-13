'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
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
import type { Field } from '@/modules/entities/konstructor/field';
import type { TemplateFieldItem } from '../../model';

interface TemplateFieldsManagerProps {
    portalId: number;
    attached: TemplateFieldItem[];
    allFields: Field[];
    attaching?: boolean;
    detaching?: boolean;
    onAttach: (fieldId: number) => void;
    onDetach: (fieldId: number) => void;
}

/**
 * Менеджер связи «шаблон ↔ поле» (`template_field`): таблица привязанных полей с
 * отвязкой и селект доступных полей справочника для привязки.
 */
export function TemplateFieldsManager({
    portalId,
    attached,
    allFields,
    attaching,
    detaching,
    onAttach,
    onDetach,
}: TemplateFieldsManagerProps) {
    const [selected, setSelected] = React.useState('');
    const fieldBase = `/portal/${portalId}/konstructor/field`;

    const attachedIds = React.useMemo(
        () => new Set(attached.map((f) => f.id)),
        [attached],
    );
    const available = React.useMemo(
        () => allFields.filter((f) => !attachedIds.has(f.id)),
        [allFields, attachedIds],
    );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-64 flex-1">
                    <Select value={selected} onValueChange={setSelected}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите поле для привязки" />
                        </SelectTrigger>
                        <SelectContent>
                            {available.length === 0 ? (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    Все поля уже привязаны
                                </div>
                            ) : (
                                available.map((f) => (
                                    <SelectItem key={f.id} value={String(f.id)}>
                                        {f.name} ({f.code})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    disabled={!selected || attaching}
                    onClick={() => {
                        if (!selected) return;
                        onAttach(Number(selected));
                        setSelected('');
                    }}
                >
                    {attaching ? 'Привязка…' : 'Привязать'}
                </Button>
            </div>

            {attached.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    К шаблону не привязано ни одного поля.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Название</TableHead>
                                <TableHead>Код</TableHead>
                                <TableHead>Тип</TableHead>
                                <TableHead className="w-24 text-right">
                                    Действия
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attached.map((f) => (
                                <TableRow key={f.id}>
                                    <TableCell>
                                        <Link
                                            href={`${fieldBase}/${f.id}`}
                                            className="text-primary underline"
                                        >
                                            {f.id}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{f.name}</TableCell>
                                    <TableCell>{f.code}</TableCell>
                                    <TableCell>{f.type ?? '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive"
                                            disabled={detaching}
                                            onClick={() => onDetach(f.id)}
                                        >
                                            Отвязать
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
