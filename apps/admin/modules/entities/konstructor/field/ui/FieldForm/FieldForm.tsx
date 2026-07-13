'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    FIELD_BOOLEAN_LABELS,
    type Field,
    type FieldBooleanKey,
    type FieldCreate,
} from '../../model';

interface FieldFormProps {
    /** Существующее поле для режима редактирования. */
    initial?: Field;
    submitting?: boolean;
    submitLabel?: string;
    onSubmit: (values: FieldCreate) => void;
    onCancel?: () => void;
}

const BOOLEAN_KEYS: FieldBooleanKey[] = [
    'isGeneral',
    'isDefault',
    'isRequired',
    'isActive',
    'isPlural',
    'isClient',
];

/**
 * Презентационная форма поля конструктора: текстовые поля + булевы флаги.
 * Сохранение делегируется через `onSubmit` (возвращает {@link FieldCreate}).
 */
export function FieldForm({
    initial,
    submitting,
    submitLabel = 'Сохранить',
    onSubmit,
    onCancel,
}: FieldFormProps) {
    const [number, setNumber] = React.useState(String(initial?.number ?? 0));
    const [name, setName] = React.useState(initial?.name ?? '');
    const [code, setCode] = React.useState(initial?.code ?? '');
    const [type, setType] = React.useState(initial?.type ?? 'string');
    const [value, setValue] = React.useState(initial?.value ?? '');
    const [description, setDescription] = React.useState(
        initial?.description ?? '',
    );
    const [bitixId, setBitixId] = React.useState(initial?.bitixId ?? '');
    const [bitrixTemplateId, setBitrixTemplateId] = React.useState(
        initial?.bitrixTemplateId ?? '',
    );
    const [flags, setFlags] = React.useState<Record<FieldBooleanKey, boolean>>({
        isGeneral: initial?.isGeneral ?? false,
        isDefault: initial?.isDefault ?? false,
        isRequired: initial?.isRequired ?? false,
        isActive: initial?.isActive ?? true,
        isPlural: initial?.isPlural ?? false,
        isClient: false,
    });

    const canSubmit = name.trim().length > 0 && code.trim().length > 0 && !!type.trim();

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            number: Number(number) || 0,
            name: name.trim(),
            code: code.trim(),
            type: type.trim(),
            isGeneral: flags.isGeneral,
            isDefault: flags.isDefault,
            isRequired: flags.isRequired,
            isActive: flags.isActive,
            isPlural: flags.isPlural,
            isClient: flags.isClient,
            value: value.trim() || undefined,
            description: description.trim() || undefined,
            bitixId: bitixId.trim() || undefined,
            bitrixTemplateId: bitrixTemplateId.trim() || undefined,
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <Label>Название *</Label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Наименование товара"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Символьный код *</Label>
                    <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="product_name"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Тип *</Label>
                    <Input
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder="string / integer / boolean / date"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Порядковый номер</Label>
                    <Input
                        type="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Значение по умолчанию</Label>
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Bitrix ID</Label>
                    <Input
                        value={bitixId}
                        onChange={(e) => setBitixId(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Bitrix Template ID</Label>
                    <Input
                        value={bitrixTemplateId}
                        onChange={(e) => setBitrixTemplateId(e.target.value)}
                    />
                </div>
                <div className="space-y-1 sm:col-span-2">
                    <Label>Описание</Label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BOOLEAN_KEYS.map((key) => (
                    <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                        <Checkbox
                            checked={flags[key]}
                            onCheckedChange={(v) =>
                                setFlags((f) => ({ ...f, [key]: v === true }))
                            }
                        />
                        {FIELD_BOOLEAN_LABELS[key]}
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
                    {submitting ? 'Сохранение…' : submitLabel}
                </Button>
            </div>
        </div>
    );
}
