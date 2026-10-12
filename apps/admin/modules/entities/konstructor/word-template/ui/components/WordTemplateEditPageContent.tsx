'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { WordTemplateForm } from '../word-template-form/WordTemplateForm';
import {
    useUpdateWordTemplate,
    useWordTemplate,
    useWordTemplatePortals,
} from '../../lib/hooks';
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
    // Текущие привязки к порталам — чтобы мультиселект в глобальном дереве
    // показывал реальное состояние, а не пустой список.
    const bindings = useWordTemplatePortals(portalId ? undefined : id);

    if (isLoading || (!portalId && bindings.isLoading)) {
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
                    // Критерии подбора: null на бэке = «для любого».
                    agent_id: template.agent_id ?? '',
                    client_types: template.client_types ?? [],
                    supply_types: template.supply_types ?? [],
                    portal_ids: (bindings.data ?? []).map((binding) => binding.portal_id),
                }}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`${listPath}/${id}`)}
                isLoading={updateTemplate.isPending}
            />
        </div>
    );
}
