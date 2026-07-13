'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    NUMERATOR_TYPE,
    NUMERATOR_TYPE_LABELS,
    type NumeratorCreate,
    type NumeratorType,
} from '../../model';

interface NumeratorFormProps {
    /** Реквизит (Rq), к которому привязывается нумератор. */
    rqId: number;
    submitting?: boolean;
    onSubmit: (values: NumeratorCreate) => void;
    onCancel?: () => void;
}

/**
 * Презентационная форма создания нумератора: счётчик (name/title), тип, префикс/
 * постфикс, флаги день/месяц/год, начальное значение и размер.
 */
export function NumeratorForm({
    rqId,
    submitting,
    onSubmit,
    onCancel,
}: NumeratorFormProps) {
    const [name, setName] = React.useState('');
    const [title, setTitle] = React.useState('');
    const [type, setType] = React.useState<NumeratorType>(NUMERATOR_TYPE.invoice);
    const [prefix, setPrefix] = React.useState('');
    const [postfix, setPostfix] = React.useState('');
    const [value, setValue] = React.useState('0');
    const [count, setCount] = React.useState('0');
    const [size, setSize] = React.useState('1');
    const [flags, setFlags] = React.useState({
        day: false,
        month: false,
        year: true,
    });

    const canSubmit = name.trim().length > 0 && title.trim().length > 0;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            rq_id: rqId,
            name: name.trim(),
            title: title.trim(),
            type,
            prefix: prefix.trim() || undefined,
            postfix: postfix.trim() || undefined,
            value: value ? Number(value) : undefined,
            count: count ? Number(count) : undefined,
            size: size ? Number(size) : undefined,
            day: flags.day,
            month: flags.month,
            year: flags.year,
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <Label>Системное имя *</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="invoice_counter"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Название *</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Нумерация счетов"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Тип документа</Label>
                    <Select
                        value={type}
                        onValueChange={(v) => setType(v as NumeratorType)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(NUMERATOR_TYPE).map((t) => (
                                <SelectItem key={t} value={t}>
                                    {NUMERATOR_TYPE_LABELS[t]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>Начальное значение</Label>
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Префикс</Label>
                    <Input
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="СЧ-"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Постфикс</Label>
                    <Input
                        value={postfix}
                        onChange={(e) => setPostfix(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Счётчик (count)</Label>
                    <Input
                        type="number"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Размер (size)</Label>
                    <Input
                        type="number"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
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
                            checked={flags[k]}
                            onCheckedChange={(v) =>
                                setFlags((f) => ({ ...f, [k]: v === true }))
                            }
                        />
                        {k === 'day' ? 'День' : k === 'month' ? 'Месяц' : 'Год'}
                    </label>
                ))}
            </div>

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel} disabled={submitting}>
                        Отмена
                    </Button>
                )}
                <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
                    {submitting ? 'Создание…' : 'Создать'}
                </Button>
            </div>
        </div>
    );
}
