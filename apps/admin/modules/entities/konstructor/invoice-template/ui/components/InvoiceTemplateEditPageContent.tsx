'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { InvoiceTemplateForm } from '../invoice-template-form/InvoiceTemplateForm';
import { useInvoiceTemplate, useUpdateInvoiceTemplate } from '../../lib/hooks';
import {
    buildUpdateInvoiceTemplatePayload,
    type InvoiceTemplateFieldError,
} from '../../lib/utils';
import type { IInvoiceTemplateFormValues } from '../../model';

interface InvoiceTemplateEditPageContentProps {
    id: string;
    listPath: string;
    portalId?: string;
}

export function InvoiceTemplateEditPageContent({
    id,
    listPath,
    portalId,
}: InvoiceTemplateEditPageContentProps) {
    const router = useRouter();
    const updateTemplate = useUpdateInvoiceTemplate();
    const { data: template, isLoading } = useInvoiceTemplate(id);
    const [fieldErrors, setFieldErrors] = React.useState<
        InvoiceTemplateFieldError[]
    >([]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold">Шаблон не найден</h1>
                <Button onClick={() => router.push(listPath)}>
                    Вернуться к списку
                </Button>
            </div>
        );
    }

    const handleSubmit = (values: IInvoiceTemplateFormValues) => {
        const result = buildUpdateInvoiceTemplatePayload(values);

        if (!result.ok) {
            setFieldErrors(result.errors);
            return;
        }

        setFieldErrors([]);
        updateTemplate.mutate(
            { id, dto: result.dto },
            { onSuccess: () => router.push(`${listPath}/${id}`) },
        );
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Редактирование шаблона счёта «{template.name}»
                </h1>
                <Button
                    variant="outline"
                    onClick={() => router.push(`${listPath}/${id}`)}
                >
                    Отмена
                </Button>
            </div>

            <InvoiceTemplateForm
                mode="edit"
                portalId={portalId}
                initialData={{
                    name: template.name,
                    visibility: template.visibility,
                    // ID остаются строками: приводить bigint к number нельзя.
                    portal_id: template.portal_id ?? '',
                    agent_id: template.agent_id ?? '',
                    client_types: template.client_types ?? [],
                    supply_types: template.supply_types ?? [],
                    description: template.description ?? '',
                    type: template.type,
                    is_default: template.is_default,
                    is_active: template.is_active,
                }}
                isLoading={updateTemplate.isPending}
                fieldErrors={fieldErrors}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`${listPath}/${id}`)}
            />
        </div>
    );
}
