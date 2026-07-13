'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import type { Template, TemplateFormValues } from '../../model';

interface TemplateFormProps {
    /** Существующий шаблон для режима редактирования. */
    initial?: Template;
    submitting?: boolean;
    submitLabel?: string;
    onSubmit: (values: TemplateFormValues) => void;
    onCancel?: () => void;
}

/**
 * Презентационная форма скалярных полей шаблона (name/code/type/link).
 * `portalId` задаётся вызывающим кодом из роутинга — здесь его нет.
 */
export function TemplateForm({
    initial,
    submitting,
    submitLabel = 'Сохранить',
    onSubmit,
    onCancel,
}: TemplateFormProps) {
    const [name, setName] = React.useState(initial?.name ?? '');
    const [code, setCode] = React.useState(initial?.code ?? '');
    const [type, setType] = React.useState(initial?.type ?? 'offer');
    const [link, setLink] = React.useState(initial?.link ?? '');

    const canSubmit =
        name.trim().length > 0 && code.trim().length > 0 && !!type.trim();

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            name: name.trim(),
            code: code.trim(),
            type: type.trim(),
            link: link.trim() || undefined,
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
                        placeholder="КП на поставку"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Символьный код *</Label>
                    <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="offer_supply"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Тип *</Label>
                    <Input
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        placeholder="offer / contract / invoice"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Ссылка на документ-шаблон</Label>
                    <Input
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://…"
                    />
                </div>
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
