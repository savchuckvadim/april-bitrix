'use client';

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { SwitchField } from '@workspace/april-ui/fields';
import { Field } from '@workspace/ui/shared';
import {
    INVOICE_CLIENT_TYPE_OPTIONS,
    INVOICE_SUPPLY_TYPE_OPTIONS,
} from '@/modules/entities/invoice-template';
import {
    useInvoiceTemplateForm,
    type InvoiceTemplateFormParams,
} from '../hooks/use-invoice-template-form';
import { InvoiceBindModeField } from './fields/InvoiceBindModeField';
import { InvoiceCriteriaField } from './fields/InvoiceCriteriaField';
import { InvoiceFileField } from './fields/InvoiceFileField';

export interface InvoiceTemplateFormProps extends InvoiceTemplateFormParams {
    isSaving: boolean;
    onCancel: () => void;
}

/** Форма шаблона счёта: файл, название, привязка, критерии подбора и флаги. */
export const InvoiceTemplateForm = ({
    isSaving,
    onCancel,
    ...params
}: InvoiceTemplateFormProps) => {
    const form = useInvoiceTemplateForm(params);

    return (
        <form className="flex flex-col gap-4" onSubmit={form.onSubmit}>
            <InvoiceFileField
                file={form.values.file}
                isEditing={form.isEditing}
                error={form.errors.file}
                onPick={file => form.patch({ file })}
            />
            <Field label="Название" required error={form.errors.name}>
                <Input
                    value={form.values.name}
                    onChange={event => form.patch({ name: event.target.value })}
                    aria-invalid={Boolean(form.errors.name)}
                />
            </Field>
            <Field label="Описание">
                <Textarea
                    rows={2}
                    value={form.values.description}
                    onChange={event => form.patch({ description: event.target.value })}
                />
            </Field>
            <InvoiceBindModeField
                mode={form.values.bindMode}
                options={form.bindOptions}
                agentId={form.values.agentId}
                providers={form.providers}
                modeError={form.errors.bindMode}
                agentError={form.errors.agentId}
                onMode={form.setBindMode}
                onAgent={agentId => form.patch({ agentId })}
            />
            <InvoiceCriteriaField
                label="Типы клиента"
                options={INVOICE_CLIENT_TYPE_OPTIONS}
                selected={form.values.clientTypes}
                onToggle={form.toggleClientType}
            />
            <InvoiceCriteriaField
                label="Тип поставки"
                options={INVOICE_SUPPLY_TYPE_OPTIONS}
                selected={form.values.supplyTypes}
                onToggle={form.toggleSupplyType}
            />
            <div className="grid gap-3 sm:grid-cols-2">
                <SwitchField
                    id="invoice-template-active"
                    label="Активен"
                    hint="Выключенный шаблон не участвует в подборе."
                    checked={form.values.isActive}
                    onChange={isActive => form.patch({ isActive })}
                />
                <SwitchField
                    id="invoice-template-default"
                    label="По умолчанию в своей группе"
                    hint="Группа: та же привязка и тот же поставщик."
                    checked={form.values.isDefault}
                    onChange={isDefault => form.patch({ isDefault })}
                />
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                    Отмена
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving
                        ? 'Сохранение…'
                        : form.isEditing
                          ? 'Сохранить изменения'
                          : 'Добавить шаблон'}
                </Button>
            </div>
        </form>
    );
};
