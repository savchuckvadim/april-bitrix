'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui';
import { WORD_TEMPLATE_PATH } from '../../consts/word-template.consts';
import {
    useCreateWordTemplate,
    useDownloadWordTemplate,
    usePortalWordTemplates,
    usePublicWordTemplates,
    useRemoveWordTemplate,
    useSetActiveWordTemplate,
    useSetDefaultWordTemplate,
    useUpdateWordTemplate,
    useUserWordTemplates,
    useWordTemplates,
} from '../../lib/hooks';
import { downloadFromResponse } from '../../lib/utils';
import { ICreateWordTemplateDto, IUpdateWordTemplateDto, IWordTemplateSummury } from '../../model';
import { WordTemplateTagsDocumentControls } from '../components/WordTemplateTagsDocumentControls';
import { WordTemplateForm } from '../word-template-form/WordTemplateForm';
import { WordTemplateTable } from '../word-template-table/WordTemplateTable';
import { WordTemplateUserWorkspace } from '../word-template-user-workspace/WordTemplateUserWorkspace';

interface WordTemplateListProps {
    portalId?: string;
    userId?: string;
    basePath?: string;
}

export function WordTemplateList({ portalId, userId, basePath }: WordTemplateListProps) {
    const router = useRouter();
    const navigationPath =
        basePath || (portalId ? `/portal/${portalId}${WORD_TEMPLATE_PATH}` : `${WORD_TEMPLATE_PATH}`);

    const allTemplates = useWordTemplates({});
    const publicTemplates = usePublicWordTemplates();
    const portalTemplates = usePortalWordTemplates(portalId || '');
    const userTemplates = useUserWordTemplates(userId || '', portalId || '');

    const createTemplate = useCreateWordTemplate();
    const updateTemplate = useUpdateWordTemplate();
    const removeTemplate = useRemoveWordTemplate();
    const setActiveTemplate = useSetActiveWordTemplate();
    const setDefaultTemplate = useSetDefaultWordTemplate();
    const downloadTemplate = useDownloadWordTemplate();

    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = React.useState(false);
    const [templateToDelete, setTemplateToDelete] = React.useState<IWordTemplateSummury | null>(null);
    const [templateToEdit, setTemplateToEdit] = React.useState<IWordTemplateSummury | null>(null);

    // Какой запрос показываем. Для (портал + пользователь) ответ — объект
    // { templates, selected }, у остальных — массив; приводим к списку ниже.
    const activeQuery = React.useMemo(() => {
        if (portalId && userId) {
            return userTemplates;
        }
        if (portalId) {
            return portalTemplates;
        }
        if (!portalId && !userId) {
            return allTemplates;
        }
        return publicTemplates;
    }, [allTemplates, portalId, portalTemplates, publicTemplates, userId, userTemplates]);

    const templates: IWordTemplateSummury[] = React.useMemo(() => {
        const data: unknown = activeQuery.data;
        if (Array.isArray(data)) {
            return data as IWordTemplateSummury[];
        }
        if (data && typeof data === 'object' && 'templates' in data) {
            return (data as { templates: IWordTemplateSummury[] }).templates;
        }
        return [];
    }, [activeQuery.data]);

    const handleCreate = async (dto: ICreateWordTemplateDto) => {
        await createTemplate.mutateAsync(dto);
        setIsCreateOpen(false);
    };

    const handleEdit = async (dto: IUpdateWordTemplateDto) => {
        if (!templateToEdit) return;
        await updateTemplate.mutateAsync({ id: templateToEdit.id, dto });
        setTemplateToEdit(null);
    };

    const handleDownload = async (item: IWordTemplateSummury) => {
        const file = await downloadTemplate.mutateAsync(item.id);
        downloadFromResponse(file, `${item.name || item.id}.docx`);
    };

    const handleDelete = (item: IWordTemplateSummury) => {
        setTemplateToDelete(item);
    };

    const handleDeleteConfirm = async () => {
        if (!templateToDelete) return;
        await removeTemplate.mutateAsync(templateToDelete.id);
        setTemplateToDelete(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-3xl font-bold">Шаблоны Word КП</h1>
                <div className="flex gap-2">
                    <Button onClick={() => setIsCreateOpen((prev) => !prev)}>
                        {isCreateOpen ? 'Закрыть форму' : 'Создать шаблон'}
                    </Button>
                    {portalId && !userId && (
                        <Button
                            variant="secondary"
                            onClick={() => setIsWorkspaceOpen((prev) => !prev)}
                        >
                            {isWorkspaceOpen ? 'Скрыть режим пользователя' : 'От лица пользователя'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => router.push(`${navigationPath}`)}
                    >
                        Обновить список
                    </Button>
                </div>
            </div>

            <WordTemplateTagsDocumentControls />

            {isCreateOpen && (
                <WordTemplateForm
                    mode="create"
                    portalId={Number(portalId)}
                    userId={Number(userId)}
                    isLoading={createTemplate.isPending}
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateOpen(false)}
                />
            )}

            {templateToEdit && (
                <WordTemplateForm
                    mode="edit"
                    portalId={Number(portalId)}
                    userId={Number(userId)}
                    initialData={{
                        name: templateToEdit.name,
                        visibility: templateToEdit.visibility as ICreateWordTemplateDto['visibility'],
                        is_default: templateToEdit.is_default,
                        is_active: templateToEdit.is_active,
                        tags: '',
                        // Критерии подбора: null на бэке = «для любого».
                        agent_id: templateToEdit.agent_id ?? '',
                        client_types: templateToEdit.client_types ?? [],
                        supply_types: templateToEdit.supply_types ?? [],
                    }}
                    isLoading={updateTemplate.isPending}
                    onSubmit={handleEdit}
                    onCancel={() => setTemplateToEdit(null)}
                />
            )}

            {portalId && !userId && isWorkspaceOpen && (
                <WordTemplateUserWorkspace portalId={portalId} />
            )}

            <WordTemplateTable
                data={templates}
                isLoading={activeQuery.isLoading}
                onRowClick={(item) => router.push(`${navigationPath}/${item.id}`)}
                onEdit={(item) => setTemplateToEdit(item)}
                onDelete={handleDelete}
                onSetActive={(item) => setActiveTemplate.mutate(item.id)}
                onSetDefault={(item) => setDefaultTemplate.mutate(item.id)}
                onDownload={handleDownload}
            />

            <ConfirmDialog
                open={!!templateToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setTemplateToDelete(null);
                    }
                }}
                title="Подтвердите удаление"
                description={`Удалить шаблон "${templateToDelete?.name || ''}"?`}
                onConfirm={handleDeleteConfirm}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
