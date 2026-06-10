'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { WordTemplateCard } from '../word-template-card/WordTemplateCard';
import {
    useDownloadWordTemplate,
    useRemoveWordTemplate,
    useSetActiveWordTemplate,
    useSetDefaultWordTemplate,
    useWordTemplate,
} from '../../lib/hooks';
import { downloadFromResponse } from '../../lib/utils';

interface WordTemplateDetailsPageContentProps {
    id: string;
    listPath: string;
}

export function WordTemplateDetailsPageContent({
    id,
    listPath,
}: WordTemplateDetailsPageContentProps) {
    const router = useRouter();
    const { data: template, isLoading } = useWordTemplate(id);
    const downloadTemplate = useDownloadWordTemplate();
    const removeTemplate = useRemoveWordTemplate();
    const setActiveTemplate = useSetActiveWordTemplate();
    const setDefaultTemplate = useSetDefaultWordTemplate();

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
                    <Button onClick={() => router.push(listPath)}>Вернуться к списку</Button>
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
                <Button onClick={() => router.push(`${listPath}/${template.id}/edit`)}>
                    Редактировать
                </Button>
            </div>

            <WordTemplateCard
                item={template}
                onDownload={async () => {
                    const file = await downloadTemplate.mutateAsync(template.id);
                    downloadFromResponse(file, `${template.name || template.id}.docx`);
                }}
                onSetActive={() => setActiveTemplate.mutate(template.id)}
                onSetDefault={() => setDefaultTemplate.mutate(template.id)}
                onDelete={async () => {
                    await removeTemplate.mutateAsync(template.id);
                    router.push(listPath);
                }}
            />
        </div>
    );
}
