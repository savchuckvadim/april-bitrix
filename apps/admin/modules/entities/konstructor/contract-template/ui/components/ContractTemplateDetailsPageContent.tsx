'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui';
import { ContractTemplateCard } from '../contract-template-card/ContractTemplateCard';
import {
    useArchiveContractTemplate,
    useContractTemplate,
    useDownloadContractTemplate,
    useRemoveContractTemplate,
    useSetActiveContractTemplate,
    useSetDefaultContractTemplate,
} from '../../lib/hooks';
import { downloadFromResponse } from '../../lib/utils';

interface ContractTemplateDetailsPageContentProps {
    id: string;
    listPath: string;
}

export function ContractTemplateDetailsPageContent({
    id,
    listPath,
}: ContractTemplateDetailsPageContentProps) {
    const router = useRouter();
    const { data: template, isLoading } = useContractTemplate(id);
    const downloadTemplate = useDownloadContractTemplate();
    const removeTemplate = useRemoveContractTemplate();
    const setActive = useSetActiveContractTemplate();
    const setDefault = useSetDefaultContractTemplate();
    const toggleArchive = useArchiveContractTemplate();
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

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

    const download = async (demo: boolean) => {
        const file = await downloadTemplate.mutateAsync({ id: template.id, demo });
        const suffix = demo ? '-пример' : '';
        downloadFromResponse(file, `${template.name || template.id}${suffix}.docx`);
    };

    return (
        <div className="container mx-auto space-y-4 p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Button variant="outline" onClick={() => router.push(listPath)}>
                    Назад к списку
                </Button>
                <Button onClick={() => router.push(`${listPath}/${template.id}/edit`)}>
                    Редактировать
                </Button>
            </div>

            <ContractTemplateCard
                item={template}
                onDownload={() => void download(false)}
                onDownloadDemo={() => void download(true)}
                onSetActive={() =>
                    setActive.mutate({ id: template.id, isActive: !template.is_active })
                }
                onSetDefault={() =>
                    setDefault.mutate({ id: template.id, isDefault: !template.is_default })
                }
                onToggleArchive={() =>
                    toggleArchive.mutate({
                        id: template.id,
                        archived: !template.is_archived,
                    })
                }
                onDelete={() => setIsDeleteOpen(true)}
            />

            <ConfirmDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Подтвердите удаление"
                description={`Удалить шаблон «${template.name}»? Файл шаблона будет удалён вместе с записью.`}
                confirmLabel="Удалить"
                variant="destructive"
                onConfirm={async () => {
                    await removeTemplate.mutateAsync(template.id);
                    router.push(listPath);
                }}
            />
        </div>
    );
}
