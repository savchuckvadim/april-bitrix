'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { InvoiceTemplateCard } from '../invoice-template-card/InvoiceTemplateCard';
import {
    useArchiveInvoiceTemplate,
    useDownloadInvoiceTemplate,
    useInvoiceTemplate,
    useRemoveInvoiceTemplate,
    useSetActiveInvoiceTemplate,
    useSetDefaultInvoiceTemplate,
    useUnarchiveInvoiceTemplate,
} from '../../lib/hooks';
import { downloadInvoiceTemplateFile } from '../../lib/utils';

interface InvoiceTemplateDetailsPageContentProps {
    id: string;
    listPath: string;
}

export function InvoiceTemplateDetailsPageContent({
    id,
    listPath,
}: InvoiceTemplateDetailsPageContentProps) {
    const router = useRouter();
    const { data: template, isLoading } = useInvoiceTemplate(id);
    const downloadTemplate = useDownloadInvoiceTemplate();
    const removeTemplate = useRemoveInvoiceTemplate();
    const setActiveTemplate = useSetActiveInvoiceTemplate();
    const setDefaultTemplate = useSetDefaultInvoiceTemplate();
    const archiveTemplate = useArchiveInvoiceTemplate();
    const unarchiveTemplate = useUnarchiveInvoiceTemplate();

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-bold">Шаблон не найден</h1>
                    <Button onClick={() => router.push(listPath)}>
                        Вернуться к списку
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto space-y-4 p-8">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => router.push(listPath)}>
                    Назад
                </Button>
                <Button
                    onClick={() =>
                        router.push(`${listPath}/${template.id}/edit`)
                    }
                >
                    Редактировать
                </Button>
            </div>

            <InvoiceTemplateCard
                item={template}
                onDownload={async () => {
                    const file = await downloadTemplate.mutateAsync(template.id);
                    downloadInvoiceTemplateFile(
                        file,
                        `${template.name || template.id}.docx`,
                    );
                }}
                onToggleActive={() =>
                    setActiveTemplate.mutate({
                        id: template.id,
                        isActive: !template.is_active,
                    })
                }
                onSetDefault={() =>
                    setDefaultTemplate.mutate({
                        id: template.id,
                        isDefault: true,
                    })
                }
                onArchive={() => archiveTemplate.mutate(template.id)}
                onUnarchive={() => unarchiveTemplate.mutate(template.id)}
                onDelete={async () => {
                    await removeTemplate.mutateAsync(template.id);
                    router.push(listPath);
                }}
            />
        </div>
    );
}
