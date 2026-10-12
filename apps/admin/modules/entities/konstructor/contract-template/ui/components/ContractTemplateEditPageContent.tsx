'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ContractTemplateForm } from '../contract-template-form/ContractTemplateForm';
import { useContractTemplate, useUpdateContractTemplate } from '../../lib/hooks';
import {
    buildUpdateContractTemplatePayload,
    contractTemplateToFormValues,
} from '../../lib/utils';
import type { IContractTemplateFormValues } from '../../model';

interface ContractTemplateEditPageContentProps {
    id: string;
    listPath: string;
    portalId?: string;
}

export function ContractTemplateEditPageContent({
    id,
    listPath,
    portalId,
}: ContractTemplateEditPageContentProps) {
    const router = useRouter();
    const { data: template, isLoading } = useContractTemplate(id);
    const updateTemplate = useUpdateContractTemplate();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="p-8 text-center">
                <h1 className="mb-4 text-2xl font-bold">Шаблон не найден</h1>
                <Button onClick={() => router.push(listPath)}>Вернуться к списку</Button>
            </div>
        );
    }

    const handleSubmit = (values: IContractTemplateFormValues) => {
        const dto = buildUpdateContractTemplatePayload(values);
        if (!dto) {
            return;
        }
        updateTemplate.mutate(
            // Файлы передаются отдельно: без них PATCH уходит JSON-ом, и
            // только так можно отправить ПУСТОЙ список (сброс в «любой»).
            { id, dto, files: { file: values.file, demo: values.demo } },
            { onSuccess: () => router.push(`${listPath}/${id}`) },
        );
    };

    return (
        <div className="container mx-auto max-w-3xl space-y-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Редактирование: {template.name}</h1>
                <Button variant="outline" onClick={() => router.push(`${listPath}/${id}`)}>
                    Отмена
                </Button>
            </div>

            <ContractTemplateForm
                mode="edit"
                portalId={portalId}
                initialValues={contractTemplateToFormValues(template)}
                isLoading={updateTemplate.isPending}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`${listPath}/${id}`)}
            />

            {updateTemplate.isError && (
                <p className="text-sm text-destructive">
                    Не удалось сохранить шаблон: {updateTemplate.error.message}
                </p>
            )}
        </div>
    );
}
