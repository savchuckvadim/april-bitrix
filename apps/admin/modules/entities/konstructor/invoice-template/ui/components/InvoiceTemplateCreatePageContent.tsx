'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceTemplateForm } from '../invoice-template-form/InvoiceTemplateForm';
import { useCreateInvoiceTemplate } from '../../lib/hooks';
import {
    buildCreateInvoiceTemplatePayload,
    type InvoiceTemplateFieldError,
} from '../../lib/utils';
import type { IInvoiceTemplateFormValues } from '../../model';

interface InvoiceTemplateCreatePageContentProps {
    listPath: string;
    portalId?: string;
}

export function InvoiceTemplateCreatePageContent({
    listPath,
    portalId,
}: InvoiceTemplateCreatePageContentProps) {
    const router = useRouter();
    const createTemplate = useCreateInvoiceTemplate();
    const [fieldErrors, setFieldErrors] = React.useState<
        InvoiceTemplateFieldError[]
    >([]);

    const handleSubmit = (values: IInvoiceTemplateFormValues) => {
        // Область видимости проверяется ЗДЕСЬ, до запроса: бэкендовая
        // parseInvoiceTemplateVisibilityScope на тех же условиях бросает 400,
        // а пользователю нужна ошибка на поле.
        const result = buildCreateInvoiceTemplatePayload(values);

        if (!result.ok) {
            setFieldErrors(result.errors);
            return;
        }

        setFieldErrors([]);
        createTemplate.mutate(result.dto, {
            onSuccess: () => router.push(listPath),
        });
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <InvoiceTemplateForm
                mode="create"
                portalId={portalId}
                isLoading={createTemplate.isPending}
                fieldErrors={fieldErrors}
                onSubmit={handleSubmit}
                onCancel={() => router.push(listPath)}
            />
        </div>
    );
}
