'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import {
    useArchiveSupplyReportTemplate,
    useDownloadSupplyReportTemplate,
    useRemoveSupplyReportTemplate,
    useSetActiveSupplyReportTemplate,
    useSetDefaultSupplyReportTemplate,
    useSupplyReportTemplate,
} from '../../lib/hooks';
import {
    downloadBlobFile,
    supplyReportTemplateFileName,
} from '../../lib/utils';
import { SupplyReportTemplateCard } from '../supply-report-template-card/SupplyReportTemplateCard';

interface SupplyReportTemplateDetailsPageContentProps {
    id: string;
    listPath: string;
}

export function SupplyReportTemplateDetailsPageContent({
    id,
    listPath,
}: SupplyReportTemplateDetailsPageContentProps) {
    const router = useRouter();
    const { data: template, isLoading } = useSupplyReportTemplate(id);
    const downloadTemplate = useDownloadSupplyReportTemplate();
    const removeTemplate = useRemoveSupplyReportTemplate();
    const setActive = useSetActiveSupplyReportTemplate();
    const setDefault = useSetDefaultSupplyReportTemplate();
    const archiveTemplate = useArchiveSupplyReportTemplate();

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
            <div className="container mx-auto py-8 text-center">
                <h1 className="mb-4 text-2xl font-bold">Шаблон не найден</h1>
                <Button onClick={() => router.push(listPath)}>
                    Вернуться к списку
                </Button>
            </div>
        );
    }

    const handleDownload = async (demo: boolean) => {
        const blob = await downloadTemplate.mutateAsync({ id, demo });
        downloadBlobFile(
            blob,
            supplyReportTemplateFileName(template, demo ? 'demo' : 'template'),
        );
    };

    return (
        <div className="container mx-auto space-y-4 p-8">
            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => router.push(listPath)}>
                    Назад
                </Button>
                <Button
                    onClick={() => router.push(`${listPath}/${template.id}/edit`)}
                >
                    Редактировать
                </Button>
            </div>

            <SupplyReportTemplateCard
                item={template}
                onDownload={() => void handleDownload(false)}
                onDownloadDemo={() => void handleDownload(true)}
                onSetActive={() =>
                    setActive.mutate({ id, isActive: !template.is_active })
                }
                onSetDefault={() => setDefault.mutate(id)}
                onArchive={() =>
                    archiveTemplate.mutate({
                        id,
                        archived: !template.is_archived,
                    })
                }
                onDelete={async () => {
                    await removeTemplate.mutateAsync(id);
                    router.push(listPath);
                }}
            />
        </div>
    );
}
