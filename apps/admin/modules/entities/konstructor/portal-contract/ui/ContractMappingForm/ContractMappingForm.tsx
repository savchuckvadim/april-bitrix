'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import type {
    PortalContract,
    PortalContractCreate,
    PortalContractForm,
} from '../../model';

interface ContractMappingFormProps {
    /** Initial-данные select-опций связей. */
    form?: PortalContractForm;
    /** Существующий договор для режима редактирования. */
    initial?: PortalContract;
    submitting?: boolean;
    submitLabel?: string;
    onSubmit: (values: PortalContractCreate) => void;
    onCancel?: () => void;
}

const toStr = (v?: number | null) => (v == null ? '' : String(v));

/**
 * Форма сопоставления связей договора портала: селекты «Вид договора»,
 * «Единица измерения», «Тип сделки» (item) плюс текстовые поля. Презентационная —
 * сохранение делегируется через `onSubmit`.
 */
export function ContractMappingForm({
    form,
    initial,
    submitting,
    submitLabel = 'Сохранить',
    onSubmit,
    onCancel,
}: ContractMappingFormProps) {
    const [contractId, setContractId] = React.useState(toStr(initial?.contract_id));
    const [portalMeasureId, setPortalMeasureId] = React.useState(
        toStr(initial?.portal_measure_id),
    );
    const [typeItemId, setTypeItemId] = React.useState(
        toStr(initial?.bitrixfield_item_id),
    );
    const [title, setTitle] = React.useState(initial?.title ?? '');
    const [template, setTemplate] = React.useState(initial?.template ?? '');
    const [order, setOrder] = React.useState(toStr(initial?.order));
    const [productName, setProductName] = React.useState(initial?.productName ?? '');
    const [description, setDescription] = React.useState(initial?.description ?? '');

    const canSubmit =
        !!contractId && !!portalMeasureId && !!typeItemId && title.trim().length > 0;

    const handleSubmit = () => {
        if (!canSubmit) return;
        onSubmit({
            contract_id: Number(contractId),
            portal_measure_id: Number(portalMeasureId),
            bitrixfield_item_id: Number(typeItemId),
            title: title.trim(),
            template: template.trim() || undefined,
            order: order ? Number(order) : undefined,
            productName: productName.trim() || undefined,
            description: description.trim() || undefined,
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                    <Label>Вид договора *</Label>
                    <Select value={contractId} onValueChange={setContractId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите вид договора" />
                        </SelectTrigger>
                        <SelectContent>
                            {(form?.contracts ?? []).map((o) => (
                                <SelectItem key={o.id} value={String(o.id)}>
                                    {o.title || o.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>Единица измерения *</Label>
                    <Select value={portalMeasureId} onValueChange={setPortalMeasureId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите единицу" />
                        </SelectTrigger>
                        <SelectContent>
                            {(form?.portalMeasures ?? []).map((o) => (
                                <SelectItem key={o.id} value={String(o.id)}>
                                    {o.title || o.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label>Тип сделки (item) *</Label>
                    <Select value={typeItemId} onValueChange={setTypeItemId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                            {(form?.contractTypeItems ?? []).map((o) => (
                                <SelectItem key={o.id} value={String(o.id)}>
                                    {o.title || o.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <Label>Заголовок *</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Договор поставки"
                    />
                </div>
                <div className="space-y-1">
                    <Label>Порядок</Label>
                    <Input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Шаблон</Label>
                    <Input
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Наименование продукта</Label>
                    <Input
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />
                </div>
                <div className="space-y-1 sm:col-span-2">
                    <Label>Описание</Label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
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
