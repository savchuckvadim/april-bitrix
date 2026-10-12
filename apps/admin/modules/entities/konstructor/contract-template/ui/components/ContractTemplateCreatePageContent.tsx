'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ContractTemplateForm } from '../contract-template-form/ContractTemplateForm';
import { useCreateContractTemplate } from '../../lib/hooks';
import {
    buildCreateContractTemplatePayload,
    emptyContractTemplateFormValues,
} from '../../lib/utils';
import type { IContractTemplateFormValues } from '../../model';

interface ContractTemplateCreatePageContentProps {
    listPath: string;
    portalId?: string;
}

export function ContractTemplateCreatePageContent({
    listPath,
    portalId,
}: ContractTemplateCreatePageContentProps) {
    const router = useRouter();
    const createTemplate = useCreateContractTemplate();

    const handleSubmit = (values: IContractTemplateFormValues) => {
        // Нормализация и проверка доменных правил — в одном месте; `null`
        // означает «форма невалидна», и запрос не отправляется вовсе.
        const payload = buildCreateContractTemplatePayload(values);
        if (!payload) {
            return;
        }
        createTemplate.mutate(payload, {
            onSuccess: () => router.push(listPath),
        });
    };

    return (
        <div className="container mx-auto max-w-3xl py-8">
            <ContractTemplateForm
                mode="create"
                portalId={portalId}
                initialValues={emptyContractTemplateFormValues(portalId)}
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
