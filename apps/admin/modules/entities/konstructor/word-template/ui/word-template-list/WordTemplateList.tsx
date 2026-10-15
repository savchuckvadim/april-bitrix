'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { ConfirmDialog } from '@/modules/shared/ui';
import type { Column } from '@/modules/shared/ui/data-table';
import { WORD_TEMPLATE_PATH } from '../../consts/word-template.consts';
import {
    useArchiveWordTemplate,
    useCreateWordTemplate,
    useDownloadWordTemplate,
    usePortalWordTemplateBindingActions,
    usePortalWordTemplateBindings,
    usePortalWordTemplates,
    usePublicWordTemplates,
    useRemoveWordTemplate,
    useSetActiveWordTemplate,
    useSetDefaultWordTemplate,
    useUnarchiveWordTemplate,
    useUpdateWordTemplate,
    useUserWordTemplates,
    useWordTemplates,
} from '../../lib/hooks';
import { downloadFromResponse } from '../../lib/utils';
import {
    ICreateWordTemplateDto,
    IUpdateWordTemplateDto,
    IWordTemplatePortalBinding,
    IWordTemplateSummury,
} from '../../model';
import { WordTemplateTagsDocumentControls } from '../components/WordTemplateTagsDocumentControls';
import { WordTemplateForm } from '../word-template-form/WordTemplateForm';
import { WordTemplateTable } from '../word-template-table/WordTemplateTable';
import { WordTemplateUserWorkspace } from '../word-template-user-workspace/WordTemplateUserWorkspace';

interface WordTemplateListProps {
    portalId?: string;
    userId?: string;
    basePath?: string;
}

/**
 * Список шаблонов Word КП.
 *
 * ГЛОБАЛЬНОЕ дерево — все шаблоны, создание публичных и портальных
 * (мультиселект порталов в форме).
 *
 * ПОРТАЛЬНОЕ дерево — то, что видит менеджер этого портала в конструкторе:
 * его портальные шаблоны ПЛЮС публичные. Для портальных показывается
 * состояние ПРИВЯЗКИ (offer_template_portal: активна / по умолчанию
 * портала) и действия с ней; публичные принадлежат всем — с портала их
 * нельзя ни удалить, ни отключить. Плюс подключение существующего шаблона
 * к порталу и режим «от лица пользователя».
 */
export function WordTemplateList({ portalId, userId, basePath }: WordTemplateListProps) {
    const router = useRouter();
    const navigationPath =
        basePath || (portalId ? `/portal/${portalId}${WORD_TEMPLATE_PATH}` : `${WORD_TEMPLATE_PATH}`);
    const isPortalMode = Boolean(portalId) && !userId;

    const allTemplates = useWordTemplates({});
    const publicTemplates = usePublicWordTemplates();
    const portalTemplates = usePortalWordTemplates(portalId || '');
    const userTemplates = useUserWordTemplates(userId || '', portalId || '');
    const bindings = usePortalWordTemplateBindings(isPortalMode ? portalId : undefined);
    const bindingActions = usePortalWordTemplateBindingActions(portalId);

    const createTemplate = useCreateWordTemplate();
    const updateTemplate = useUpdateWordTemplate();
    const removeTemplate = useRemoveWordTemplate();
    const setActiveTemplate = useSetActiveWordTemplate();
    const setDefaultTemplate = useSetDefaultWordTemplate();
    const downloadTemplate = useDownloadWordTemplate();
    const archiveTemplate = useArchiveWordTemplate();
    const unarchiveTemplate = useUnarchiveWordTemplate();

    const [isCreateOpen, setIsCreateOpen] = React.useState(false);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = React.useState(false);
    const [isAttachOpen, setIsAttachOpen] = React.useState(false);
    const [attachTemplateId, setAttachTemplateId] = React.useState('');
    const [templateToDelete, setTemplateToDelete] = React.useState<IWordTemplateSummury | null>(null);
    const [bindingToDetach, setBindingToDetach] = React.useState<IWordTemplateSummury | null>(null);
    const [templateToEdit, setTemplateToEdit] = React.useState<IWordTemplateSummury | null>(null);

    const bindingByTemplate = React.useMemo(() => {
        const map = new Map<string, IWordTemplatePortalBinding>();
        for (const binding of bindings.data ?? []) {
            map.set(String(binding.offer_template_id), binding);
        }
        return map;
    }, [bindings.data]);

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
        let list: IWordTemplateSummury[] = [];
        if (Array.isArray(data)) {
            list = data as IWordTemplateSummury[];
        } else if (data && typeof data === 'object' && 'templates' in data) {
            list = (data as { templates: IWordTemplateSummury[] }).templates;
        }
        // Портал видит и публичные шаблоны — как менеджер в конструкторе.
        if (isPortalMode) {
            const seen = new Set(list.map((t) => String(t.id)));
            const publicOnly = (publicTemplates.data ?? []).filter((t) => !seen.has(String(t.id)));
            return [...list, ...publicOnly];
        }
        return list;
    }, [activeQuery.data, isPortalMode, publicTemplates.data]);

    // Кандидаты на подключение: все портальные шаблоны, ещё не привязанные.
    const attachCandidates = React.useMemo(
        () =>
            (allTemplates.data ?? []).filter(
                (t) => t.visibility === 'private' && !bindingByTemplate.has(String(t.id)),
            ),
        [allTemplates.data, bindingByTemplate],
    );

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

    const handleDeleteConfirm = async () => {
        if (!templateToDelete) return;
        await removeTemplate.mutateAsync(templateToDelete.id);
        setTemplateToDelete(null);
    };

    const handleDetachConfirm = async () => {
        const binding = bindingToDetach ? bindingByTemplate.get(String(bindingToDetach.id)) : undefined;
        if (!binding) return;
        await bindingActions.detach.mutateAsync(binding.id);
        setBindingToDetach(null);
    };

    const handleAttach = async () => {
        if (!attachTemplateId) return;
        await bindingActions.attach.mutateAsync(attachTemplateId);
        setAttachTemplateId('');
        setIsAttachOpen(false);
    };

    /** Колонка состояния привязки — только в портальном режиме. */
    const extraColumns: Column<IWordTemplateSummury>[] = isPortalMode
        ? [
              {
                  id: 'binding',
                  header: 'На портале',
                  cell: (row) => {
                      if (row.visibility === 'public') {
                          return <span className="text-muted-foreground">публичный</span>;
                      }
                      const binding = bindingByTemplate.get(String(row.id));
                      if (!binding) {
                          return <span className="text-muted-foreground">не подключён</span>;
                      }
                      return (
                          <span>
                              {binding.is_active ? 'подключён' : 'отключён'}
                              {binding.is_default ? ' · по умолчанию' : ''}
                          </span>
                      );
                  },
                  className: 'w-40',
              },
          ]
        : [];

    const renderBindingActions = (row: IWordTemplateSummury): React.ReactNode => {
        if (!isPortalMode || row.visibility === 'public') {
            return null;
        }
        const binding = bindingByTemplate.get(String(row.id));
        if (!binding) {
            return null;
        }
        const busy = bindingActions.setActive.isPending || bindingActions.setDefault.isPending;
        return (
            <>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={(e) => {
                        e.stopPropagation();
                        bindingActions.setActive.mutate({ bindingId: binding.id, isActive: !binding.is_active });
                    }}
                >
                    {binding.is_active ? 'Отключить на портале' : 'Включить на портале'}
                </Button>
                {!binding.is_default && (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={(e) => {
                            e.stopPropagation();
                            bindingActions.setDefault.mutate({ bindingId: binding.id, isDefault: true });
                        }}
                    >
                        По умолчанию портала
                    </Button>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setBindingToDetach(row);
                    }}
                >
                    Отвязать
                </Button>
            </>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-3xl font-bold">Шаблоны Word КП</h1>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setIsCreateOpen((prev) => !prev)}>
                        {isCreateOpen ? 'Закрыть форму' : 'Создать шаблон'}
                    </Button>
                    {isPortalMode && (
                        <Button variant="secondary" onClick={() => setIsAttachOpen((prev) => !prev)}>
                            {isAttachOpen ? 'Скрыть подключение' : 'Подключить существующий'}
                        </Button>
                    )}
                    {isPortalMode && (
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
                    portalId={portalId}
                    userId={userId}
                    isLoading={createTemplate.isPending}
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateOpen(false)}
                />
            )}

            {isPortalMode && isAttachOpen && (
                <div className="flex flex-wrap items-end gap-3 rounded-md border p-4">
                    <div className="min-w-[320px] space-y-2">
                        <Label htmlFor="attach-template">Подключить существующий портальный шаблон</Label>
                        <Select value={attachTemplateId} onValueChange={setAttachTemplateId}>
                            <SelectTrigger id="attach-template">
                                <SelectValue
                                    placeholder={
                                        attachCandidates.length === 0
                                            ? 'Все портальные шаблоны уже подключены'
                                            : 'Выберите шаблон'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {attachCandidates.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name} (#{t.id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleAttach}
                        disabled={!attachTemplateId || bindingActions.attach.isPending}
                    >
                        Подключить
                    </Button>
                    <p className="w-full text-xs text-muted-foreground">
                        Привязка создаётся активной. Сам шаблон не копируется — он общий для всех
                        порталов, к которым подключён.
                    </p>
                </div>
            )}

            {templateToEdit && (
                <WordTemplateForm
                    mode="edit"
                    portalId={portalId}
                    userId={userId}
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

            {isPortalMode && isWorkspaceOpen && portalId && (
                <WordTemplateUserWorkspace portalId={portalId} />
            )}

            <WordTemplateTable
                data={templates}
                isLoading={activeQuery.isLoading || (isPortalMode && bindings.isLoading)}
                onRowClick={(item) => router.push(`${navigationPath}/${item.id}`)}
                onEdit={(item) => setTemplateToEdit(item)}
                onDelete={(item) => setTemplateToDelete(item)}
                canDelete={(item) => !(isPortalMode && item.visibility === 'public')}
                onSetActive={(item) => setActiveTemplate.mutate(item.id)}
                onSetDefault={(item) => setDefaultTemplate.mutate(item.id)}
                onDownload={handleDownload}
                onArchive={(item) => archiveTemplate.mutate(item.id)}
                onUnarchive={(item) => unarchiveTemplate.mutate(item.id)}
                extraColumns={extraColumns}
                renderExtraActions={renderBindingActions}
            />

            <ConfirmDialog
                open={!!templateToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setTemplateToDelete(null);
                    }
                }}
                title="Подтвердите удаление"
                description={`Удалить шаблон "${templateToDelete?.name || ''}" целиком, вместе с файлом и привязками ко всем порталам?`}
                onConfirm={handleDeleteConfirm}
                confirmLabel="Удалить"
                variant="destructive"
            />

            <ConfirmDialog
                open={!!bindingToDetach}
                onOpenChange={(open) => {
                    if (!open) {
                        setBindingToDetach(null);
                    }
                }}
                title="Отвязать от портала"
                description={`Шаблон "${bindingToDetach?.name || ''}" перестанет быть виден на этом портале. Сам шаблон и его привязки к другим порталам останутся.`}
                onConfirm={handleDetachConfirm}
                confirmLabel="Отвязать"
                variant="destructive"
            />
        </div>
    );
}
