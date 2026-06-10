'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { useWordTemplate } from '../hooks/useWordTemplate';
import { useWordTemplatePdfPreview } from '../hooks/useWordTemplatePdfPreview';
import {
    WordTemplateSummary,
    CreateWordTemplateRequest,
    UpdateWordTemplateRequest,
    WordTemplateVisibility,
    WordTemplate,
    CreateWordTemplateThunkDto,
} from '../types/word-template-types';
import { WordTemplateForm, WordTemplateList, WordTemplateCurrentInfo } from './components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs';
import { RefreshCw } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { WordTemplatePdfPreviewPanel } from './WordTemplatePdfPreviewPanel';
// import { resolveCurrentInvoiceTemplateThunk } from '@/modules/invoice-template/model/thunks/invoice-template-resolve-current-thunk';
// import { InvoiceTemplateTabPanel } from '@/modules/invoice-template/ui';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';

type SettingsTab = 'templates' | 'editor' | 'preview' | 'invoice';

export const WordTemplateSettingsWidget: React.FC = () => {
    const dispatch = useAppDispatch();

    const {
        publicTemplates,
        userTemplates,
        portalTemplates,
        selectedTemplate,
        favorites,
        isLoading,
    } = useAppSelector((state) => state.offerTemplateWord);
    const portal = useAppSelector((state) => state.portal.current);
    const userId = useAppSelector((state) => state.app.bitrix.user?.ID);
    const isSuperUser = useAppSelector((state) => (state.app as { isSuperUser?: boolean }).isSuperUser ?? false);
    const portalIdForInvoice = useAppSelector((state) => state.portal.current?.id);
    const invoiceProviderKey = useAppSelector((state) => state.documentProvider.current?.id);

    const { setPreviewListenersActive } = useWordTemplatePdfPreview();

    const { create, update, remove, setCurrent, download, refresh } = useWordTemplate();

    const [editingTemplate, setEditingTemplate] = useState<WordTemplateSummary | null>(null);

    const [activeTab, setActiveTab] = useState<SettingsTab>('templates');
    const [search, setSearch] = useState('');

    const canAdd = userTemplates.length < 10;

    const previewTab: SettingsTab = 'preview';
    const invoiceTab: SettingsTab = 'invoice';

    useEffect(() => {
        const isPreview = activeTab === previewTab;
        setPreviewListenersActive(isPreview);
        return () => setPreviewListenersActive(false);
    }, [activeTab, previewTab, setPreviewListenersActive]);

    useEffect(() => {
        // dispatch(resolveCurrentInvoiceTemplateThunk());
    }, [dispatch, invoiceProviderKey, portalIdForInvoice]);

    const allTemplates = useMemo(() => {
        return [...publicTemplates, ...portalTemplates, ...userTemplates].filter(
            (template, index, self) => index === self.findIndex((t) => t.id === template.id),
        );
    }, [publicTemplates, portalTemplates, userTemplates]);

    const handleCreate = async (data: CreateWordTemplateThunkDto) => {
        try {
            create(data);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setActiveTab('templates');
        } catch (error) {
            console.error('Failed to create template:', error);
            throw error;
        }
    };

    const handleUpdate = async (data: UpdateWordTemplateRequest) => {
        if (!editingTemplate) return;

        try {
            const visibility = (data.visibility || editingTemplate.visibility) as WordTemplateVisibility;
            let portal_id: number | undefined;
            let user_id: number | undefined;

            if (visibility === WordTemplateVisibility.PUBLIC) {
                portal_id = undefined;
                user_id = undefined;
            } else if (visibility === WordTemplateVisibility.PORTAL) {
                portal_id = portal?.id;
                user_id = undefined;
            } else {
                portal_id = portal?.id;
                user_id = userId ? Number(userId) : undefined;
            }

            await update(editingTemplate.id.toString(), {
                ...data,
                visibility,
                portal_id,
                user_id,
            });

            setEditingTemplate(null);
            setActiveTab('templates');
        } catch (error) {
            console.error('Failed to update template:', error);
            throw error;
        }
    };

    const handleSubmit = async (data: CreateWordTemplateRequest | UpdateWordTemplateRequest) => {
        if (editingTemplate) {
            await handleUpdate(data as UpdateWordTemplateRequest);
        } else {
            await handleCreate(data as CreateWordTemplateRequest);
        }
    };

    const handleDelete = async (template: WordTemplateSummary) => {
        if (!confirm(`Удалить шаблон "${template.name}"?`)) {
            return;
        }

        remove({ id: template.id.toString() });
    };

    const handleSelect = async (template: WordTemplateSummary) => {
        setCurrent(template as WordTemplate);
    };

    const handleDownload = async (template: WordTemplateSummary) => {
        try {
            await download(template.id.toString(), template.name);
        } catch (error) {
            console.error('Failed to download template:', error);
            alert('Ошибка при скачивании шаблона');
        }
    };

    const canEdit = (template: WordTemplateSummary) => {
        const visibility = String(template.visibility).toLowerCase();
        if (visibility === WordTemplateVisibility.PUBLIC || visibility === 'public') {
            return isSuperUser;
        }
        return true;
    };

    const canDelete = (template: WordTemplateSummary) => {
        const visibility = String(template.visibility).toLowerCase();
        if (visibility === WordTemplateVisibility.PUBLIC || visibility === 'public') {
            return isSuperUser;
        }
        return true;
    };

    const handlePrimaryAction = () => {
        if (activeTab === previewTab || activeTab === invoiceTab) {
            setActiveTab('templates');
            return;
        }
        if (activeTab === 'templates' && canAdd) {
            setActiveTab('editor');
            return;
        }
        setActiveTab('templates');
    };

    const primaryLabel =
        activeTab === 'templates' && canAdd
            ? '+ Создать'
            : activeTab === 'editor' || activeTab === previewTab || activeTab === invoiceTab
              ? '← к шаблонам'
              : null;

    return (
        <div className="word-template-settings-widget flex min-h-0 flex-col gap-4">
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as SettingsTab)}
                className="flex min-h-0 flex-1 flex-col gap-4"
            >
                <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList
                        className={cn(
                            'h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1 sm:w-auto',
                        )}
                    >
                        <TabsTrigger value="templates" className="text-xs sm:text-sm">
                            Шаблоны
                        </TabsTrigger>
                        {canAdd && (
                            <TabsTrigger value="editor" className="text-xs sm:text-sm">
                                {editingTemplate ? 'Редактировать' : 'Создать'}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value={previewTab} className="text-xs sm:text-sm">
                            Превью
                        </TabsTrigger>
                        <TabsTrigger value={invoiceTab} className="text-xs sm:text-sm">
                            Счёт
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex shrink-0 items-center gap-2">
                        {canAdd && primaryLabel && (
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                    setEditingTemplate(null);
                                    handlePrimaryAction();
                                }}
                            >
                                {primaryLabel}
                            </Button>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0"
                                    onClick={() => refresh()}
                                    aria-label="Обновить список"
                                >
                                    <RefreshCw className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Обновить</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <TabsContent value="templates" className="mt-0 flex min-h-0 flex-col gap-4 outline-none">
                    <WordTemplateCurrentInfo
                        template={selectedTemplate}
                        onDownload={() => selectedTemplate && handleDownload(selectedTemplate)}
                    />
                    <WordTemplateList
                        templates={allTemplates}
                        favorites={favorites}
                        isSuperUser={isSuperUser}
                        search={search}
                        onSearchChange={setSearch}
                        onSelect={handleSelect}
                        onEdit={(template) => {
                            setEditingTemplate(template);
                            setActiveTab('editor');
                        }}
                        onDelete={handleDelete}
                        onDownload={handleDownload}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                </TabsContent>

                {canAdd && (
                    <TabsContent value="editor" className="mt-0 min-h-0 outline-none">
                        <WordTemplateForm
                            editingTemplate={editingTemplate}
                            isSuperUser={isSuperUser}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setEditingTemplate(null);
                                setActiveTab('templates');
                            }}
                            isLoading={isLoading}
                        />
                    </TabsContent>
                )}

                <TabsContent
                    value={previewTab}
                    className="mt-0 flex min-h-80 max-h-[70vh] flex-1 flex-col overflow-hidden outline-none"
                >
                    <WordTemplatePdfPreviewPanel />
                </TabsContent>

                {/* <TabsContent value={invoiceTab} className="mt-0 min-h-0 outline-none">
                    <InvoiceTemplateTabPanel />
                </TabsContent> */}
            </Tabs>
        </div>
    );
};
