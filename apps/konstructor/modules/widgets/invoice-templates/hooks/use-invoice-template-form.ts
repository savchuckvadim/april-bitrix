'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    INVOICE_CLIENT_TYPE_CODES,
    INVOICE_SUPPLY_TYPE_CODES,
    applyBindMode,
    availableBindModes,
    defaultBindMode,
    emptyInvoiceTemplateForm,
    formValuesOfTemplate,
    toCreateInput,
    toUpdateInput,
    toggleCode,
    validateInvoiceTemplateForm,
    type InvoiceBindMode,
    type InvoiceClientType,
    type InvoiceSupplyType,
    type InvoiceTemplate,
    type InvoiceTemplateCreateInput,
    type InvoiceTemplateFormErrors,
    type InvoiceTemplateFormValues,
    type InvoiceTemplateQuota,
    type InvoiceTemplateUpdateInput,
} from '@/modules/entities/invoice-template';

export interface InvoiceTemplateFormParams {
    /** Правимый шаблон; `null` при создании. */
    editing: InvoiceTemplate | null;
    quota: InvoiceTemplateQuota;
    onCreate: (input: InvoiceTemplateCreateInput) => Promise<boolean>;
    onUpdate: (id: string, input: InvoiceTemplateUpdateInput) => Promise<boolean>;
    /** Вызывается после успешного сохранения. */
    onSaved: () => void;
}

/**
 * Форма шаблона счёта: значения, режимы привязки, ошибки полей и отправка.
 * Форма монтируется вместе с окном, поэтому начальные значения берутся один
 * раз: из шаблона при правке, пустые при создании.
 */
export const useInvoiceTemplateForm = ({
    editing,
    quota,
    onCreate,
    onUpdate,
    onSaved,
}: InvoiceTemplateFormParams) => {
    const portalId = useAppSelector(state => state.portal.current?.id ?? null);
    const providers = useAppSelector(state => state.documentProvider.items);
    const isSuperUser = useAppSelector(state => state.app.isSuperUser);
    const userId = useAppSelector(state => Number(state.app.bitrix.user?.ID) || 0);

    const access = useMemo(
        () => ({
            isSuperUser,
            portalId,
            providerCount: providers.length,
            quota,
            editing,
        }),
        [isSuperUser, portalId, providers.length, quota, editing],
    );
    const modes = useMemo(() => availableBindModes(access), [access]);
    const providerIds = useMemo(() => providers.map(item => item.id), [providers]);

    const [values, setValues] = useState<InvoiceTemplateFormValues>(() =>
        editing
            ? formValuesOfTemplate(editing)
            : emptyInvoiceTemplateForm(defaultBindMode(access) ?? 'portal'),
    );
    const [errors, setErrors] = useState<InvoiceTemplateFormErrors>({});
    // текущая привязка остаётся в списке, даже когда выбрать её заново нельзя
    const bindOptions = useMemo(
        () => (modes.includes(values.bindMode) ? modes : [values.bindMode, ...modes]),
        [modes, values.bindMode],
    );

    const patch = (next: Partial<InvoiceTemplateFormValues>) => {
        setValues(current => ({ ...current, ...next }));
        // правка поля снимает его ошибку
        setErrors(current => {
            const cleared = { ...current };
            if ('name' in next) delete cleared.name;
            if ('file' in next) delete cleared.file;
            if ('agentId' in next) delete cleared.agentId;
            return cleared;
        });
    };

    const save = async (): Promise<boolean> => {
        if (editing) {
            return onUpdate(editing.id, toUpdateInput(values, portalId));
        }
        const input = toCreateInput(values, portalId, userId);
        return input ? onCreate(input) : false;
    };

    const submit = async () => {
        const found = validateInvoiceTemplateForm(values, {
            isEditing: editing !== null,
            availableModes: modes,
        });
        setErrors(found);
        if (Object.keys(found).length) return;
        if (await save()) onSaved();
    };

    return {
        values,
        errors,
        bindOptions,
        providers,
        isEditing: editing !== null,
        patch,
        setBindMode: (mode: InvoiceBindMode) => {
            setValues(current => applyBindMode(current, mode, providerIds));
            setErrors(current => ({ ...current, bindMode: undefined, agentId: undefined }));
        },
        toggleClientType: (code: InvoiceClientType) =>
            patch({
                clientTypes: toggleCode(
                    INVOICE_CLIENT_TYPE_CODES,
                    values.clientTypes,
                    code,
                ),
            }),
        toggleSupplyType: (code: InvoiceSupplyType) =>
            patch({
                supplyTypes: toggleCode(
                    INVOICE_SUPPLY_TYPE_CODES,
                    values.supplyTypes,
                    code,
                ),
            }),
        onSubmit: (event: FormEvent) => {
            event.preventDefault();
            void submit();
        },
    };
};
