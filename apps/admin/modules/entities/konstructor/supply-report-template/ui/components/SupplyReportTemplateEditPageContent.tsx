'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import {
    useSupplyReportTemplate,
    useUpdateSupplyReportTemplate,
} from '../../lib/hooks';
import { buildUpdatePayload, formValuesOfTemplate } from '../../lib/utils';
import type { ISupplyReportTemplateFormValues } from '../../model';
import { SupplyReportTemplateForm } from '../supply-report-template-form/SupplyReportTemplateForm';

interface SupplyReportTemplateEditPageContentProps {
    id: string;
    listPath: string;
    portalId?: string;
}

export function SupplyReportTemplateEditPageContent({
    id,
    listPath,
    portalId,
}: SupplyReportTemplateEditPageContentProps) {
    const router = useRouter();
    const { data: template, isLoading } = useSupplyReportTemplate(id);
    const updateTemplate = useUpdateSupplyReportTemplate();

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
                <Button onClick={() => router.push(listPath)}>
                    Вернуться к списку
                </Button>
            </div>
        );
    }

    const handleSubmit = (values: ISupplyReportTemplateFormValues) => {
        updateTemplate.mutate(
            { id, dto: buildUpdatePayload(values) },
            { onSuccess: () => router.push(`${listPath}/${id}`) },
        );
    };

    return (
        <div className="container mx-auto max-w-3xl space-y-4 py-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Редактирование: {template.name}
                </h1>
                <Button
                    variant="outline"
                    onClick={() => router.push(`${listPath}/${id}`)}
                >
                    Отмена
                </Button>
            </div>

            <SupplyReportTemplateForm
                mode="edit"
                portalId={portalId}
                initialValues={formValuesOfTemplate(template)}
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
