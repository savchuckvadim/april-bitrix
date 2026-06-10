'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { WordTemplateForm } from '../word-template-form/WordTemplateForm';
import { useUpdateWordTemplate, useWordTemplate } from '../../lib/hooks';
import { IUpdateWordTemplateDto } from '../../model';

interface WordTemplateEditPageContentProps {
    id: string;
    listPath: string;
    portalId?: string;
}

export function WordTemplateEditPageContent({
    id,
    listPath,
    portalId,
}: WordTemplateEditPageContentProps) {
    const router = useRouter();
    const updateTemplate = useUpdateWordTemplate();
    const { data: template, isLoading } = useWordTemplate(id);

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
                <Button onClick={() => router.push(listPath)}>Вернуться к списку</Button>
            </div>
        );
    }

    const handleSubmit = (dto: IUpdateWordTemplateDto) => {
        updateTemplate.mutate(
            { id, dto },
            {
                onSuccess: () => router.push(`${listPath}/${id}`),
            }
        );
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Редактирование шаблона {template.name}</h1>
                <Button variant="outline" onClick={() => router.push(`${listPath}/${id}`)}>
                    Отмена
                </Button>
            </div>

            <WordTemplateForm
                mode="edit"
                portalId={portalId}
                initialData={{
                    name: template.name,
                    visibility: template.visibility,
                    is_default: template.is_default,
                    is_active: template.is_active,
                    tags: template.tags || '',
                    portal_id: portalId ? Number(portalId) : undefined,
                }}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`${listPath}/${id}`)}
                isLoading={updateTemplate.isPending}
            />
        </div>
    );
}
