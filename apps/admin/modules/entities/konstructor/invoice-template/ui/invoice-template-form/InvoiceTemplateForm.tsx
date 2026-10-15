'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { ACard, FileUpload } from '@workspace/ui/shared';
import { FormFieldRenderer } from '@/modules/shared/ui/form-field-renderer';
import { FormSubmitFooter } from '@/modules/shared/ui/form-submit-footer';
import { usePortalOptions, useProviderOptions } from '@/modules/entities/konstructor/lib';
import {
    INVOICE_TEMPLATE_TYPE,
    INVOICE_TEMPLATE_VISIBILITY,
    type IInvoiceTemplateFormValues,
} from '../../model';
import { invoiceTemplateFormFields } from '../../consts/invoice-template-form.consts';
import type { InvoiceTemplateFieldError } from '../../lib/utils';

interface InvoiceTemplateFormProps {
    mode: 'create' | 'edit';
    initialData?: Partial<IInvoiceTemplateFormValues>;
    /** Портальное дерево: портал известен и не редактируется. */
    portalId?: string;
    isLoading?: boolean;
    /**
     * Отправка. Нормализация и проверка области видимости делаются
     * вызывающим кодом (`lib/utils`), а ошибки возвращаются сюда через
     * `fieldErrors`, чтобы пользователь увидел их НА ПОЛЯХ.
     */
    onSubmit: (values: IInvoiceTemplateFormValues) => void;
    onCancel?: () => void;
    /** Ошибки полей от доменной проверки. */
    fieldErrors?: InvoiceTemplateFieldError[];
}

export function InvoiceTemplateForm({
    mode,
    initialData,
    portalId,
    isLoading = false,
    onSubmit,
    onCancel,
    fieldErrors,
}: InvoiceTemplateFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        setError,
        formState: { errors },
    } = useForm<IInvoiceTemplateFormValues>({
        defaultValues: {
            name: initialData?.name ?? '',
            // В портальном дереве по умолчанию «Портал»: шаблон создаётся
            // для этого портала, а не общий для всех.
            visibility:
                initialData?.visibility ??
                (portalId
                    ? INVOICE_TEMPLATE_VISIBILITY.portal
                    : INVOICE_TEMPLATE_VISIBILITY.public),
            portal_id: initialData?.portal_id ?? portalId ?? '',
            agent_id: initialData?.agent_id ?? '',
            client_types: initialData?.client_types ?? [],
            supply_types: initialData?.supply_types ?? [],
            description: initialData?.description ?? '',
            type: initialData?.type ?? INVOICE_TEMPLATE_TYPE.word,
            is_default: initialData?.is_default ?? false,
            is_active: initialData?.is_active ?? true,
            file: initialData?.file,
        },
    });

    const visibility = watch('visibility');
    const selectedFile = watch('file');
    const selectedPortalId = watch('portal_id');

    // Поле поставщика нужно только для видимости «Поставщик»: показывать его
    // всегда — приглашать заполнить то, что бэк всё равно отбросит.
    const showAgent = visibility === INVOICE_TEMPLATE_VISIBILITY.provider;

    // Селекты вместо ввода id: порталы — справочник, поставщики — выбранного портала.
    const portalOptions = usePortalOptions();
    const effectivePortalId = portalId ?? (selectedPortalId ? String(selectedPortalId) : undefined);
    const providerOptions = useProviderOptions(effectivePortalId);

    const fields = React.useMemo(
        () =>
            invoiceTemplateFormFields({
                portalLocked: !!portalId,
                showAgent,
                portalOptions: portalOptions.options,
                portalsLoading: portalOptions.isLoading,
                providerOptions: providerOptions.options,
                providersLoading: providerOptions.isLoading,
                hasPortal: providerOptions.hasPortal,
            }),
        [portalId, showAgent, portalOptions, providerOptions],
    );

    // Ошибки доменной проверки расставляются по полям формы, а не выводятся
    // одним баннером: пользователь должен видеть, ЧТО именно заполнить.
    React.useEffect(() => {
        for (const fieldError of fieldErrors ?? []) {
            setError(fieldError.field, {
                type: 'validate',
                message: fieldError.message,
            });
        }
    }, [fieldErrors, setError]);

    return (
        <ACard
            title={
                mode === 'create' ? 'Создать шаблон счёта' : 'Редактировать шаблон счёта'
            }
            description="Загрузите файл шаблона и задайте условия, при которых он подбирается"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {fields.map((fieldConfig) => (
                    <FormFieldRenderer<IInvoiceTemplateFormValues>
                        key={fieldConfig.name}
                        fieldConfig={fieldConfig}
                        register={register}
                        control={control}
                        errors={errors}
                    />
                ))}

                <FileUpload
                    label={
                        mode === 'create'
                            ? 'Файл шаблона (.docx)'
                            : 'Новый файл шаблона (.docx) — не обязателен'
                    }
                    required={mode === 'create'}
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    value={(selectedFile as File | undefined) ?? null}
                    onChange={(file) => setValue('file', file ?? undefined)}
                    error={errors.file?.message as string | undefined}
                    helperText={
                        mode === 'edit'
                            ? 'Файл не выбран — текущий файл шаблона останется без изменений.'
                            : undefined
                    }
                />

                <FormSubmitFooter
                    isLoading={isLoading}
                    onCancel={onCancel}
                    mode={mode}
                />
            </form>
        </ACard>
    );
}
