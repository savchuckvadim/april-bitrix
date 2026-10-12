'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCreateSupplyReportTemplate } from '../../lib/hooks';
import { buildCreatePayload } from '../../lib/utils';
import type { ISupplyReportTemplateFormValues } from '../../model';
import { SupplyReportTemplateForm } from '../supply-report-template-form/SupplyReportTemplateForm';

interface SupplyReportTemplateCreatePageContentProps {
    listPath: string;
    portalId?: string;
}

export function SupplyReportTemplateCreatePageContent({
    listPath,
    portalId,
}: SupplyReportTemplateCreatePageContentProps) {
    const router = useRouter();
    const createTemplate = useCreateSupplyReportTemplate();

    const handleSubmit = (values: ISupplyReportTemplateFormValues) => {
        // Форма не отправляется без файла, но типы этого не знают.
        if (!values.file) {
            return;
        }
        createTemplate.mutate(buildCreatePayload(values, values.file), {
            onSuccess: () => router.push(listPath),
        });
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <SupplyReportTemplateForm
                mode="create"
                portalId={portalId}
                isLoading={createTemplate.isPending}
                onSubmit={handleSubmit}
                onCancel={() => router.push(listPath)}
            />
            {createTemplate.isError && (
                <p className="mt-4 text-sm text-destructive">
                    Не удалось создать шаблон: {createTemplate.error.message}
                </p>
            )}
        </div>
    );
}
