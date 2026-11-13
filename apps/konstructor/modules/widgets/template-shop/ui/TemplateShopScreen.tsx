'use client';

import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';
import { WordTemplateTagsExampleDownloadButton } from '@/modules/entities/offer-template-word';
import { Screen, ScreenHeader } from '@/modules/shared';
import { usePreviewVersions } from '../hooks/use-preview-versions';
import { useTemplateForm } from '../hooks/use-template-form';
import { useTemplateShop } from '../hooks/use-template-shop';
import { canManagePreview, canManageTemplate } from '../lib/template-shop.util';
import { TemplateFormDialog } from './TemplateFormDialog';
import { TemplatePreviewDialog } from './TemplatePreviewDialog';
import { TemplateShopCard } from './TemplateShopCard';
import { TemplateShopToolbar } from './TemplateShopToolbar';

/**
 * Витрина шаблонов КП: превью первой страницы на примере «Гарант-Офис»,
 * вкладки и поиск, выбор шаблона для КП, избранное. Загрузка и правка —
 * окном; своё превью и правка общедоступных — суперпользователю April.
 */
export const TemplateShopScreen = () => {
    const shop = useTemplateShop();
    const previews = usePreviewVersions();
    const form = useTemplateForm(previews.bump);
    const selectedPreview = shop.previewOf;

    return (
        <Screen width="full" className="gap-4">
            <ScreenHeader
                title="Шаблоны КП"
                description="Выберите Word-шаблон коммерческого предложения. Превью собрано на примере комплекта «Гарант-Офис»."
                actions={
                    <>
                        {shop.canAdd ? (
                            <Button onClick={form.openCreate}>
                                <Plus aria-hidden />
                                Загрузить шаблон
                            </Button>
                        ) : null}
                        <WordTemplateTagsExampleDownloadButton />
                        <Button variant="ghost" onClick={shop.back}>
                            <ArrowLeft aria-hidden />
                            Назад
                        </Button>
                    </>
                }
            />
            <TemplateShopToolbar
                scope={shop.scope}
                search={shop.search}
                shown={shop.items.length}
                total={shop.total}
                onScope={shop.setScope}
                onSearch={shop.setSearch}
            />
            {shop.isLoading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-5">
                    {Array.from({ length: 8 }, (_, index) => (
                        <div key={index} className="aspect-[1/1.6] animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            ) : shop.items.length ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-5 p-1">
                    {shop.items.map(template => (
                        <TemplateShopCard
                            key={template.id}
                            template={template}
                            selected={String(template.id) === shop.viewer.selectedId}
                            favorite={shop.viewer.favorites.includes(String(template.id))}
                            canManage={canManageTemplate(template, shop.viewer)}
                            canManagePreview={canManagePreview(template, shop.viewer)}
                            previewVersion={previews.versionOf(String(template.id))}
                            onSelect={() => shop.select(template)}
                            onOpenPreview={() => shop.openPreview(template)}
                            onToggleFavorite={() => shop.toggleFavorite(template)}
                            onDownload={() => shop.download(template)}
                            onEdit={() => form.openEdit(template)}
                            onDelete={() => shop.remove(template)}
                            onUploadPreview={file => void previews.upload(template, file)}
                            onResetPreview={() => void previews.reset(template)}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={FileText}
                    title="Шаблонов не нашлось"
                    description="Смените вкладку или уточните поиск."
                />
            )}
            <TemplatePreviewDialog
                template={selectedPreview}
                selected={selectedPreview ? String(selectedPreview.id) === shop.viewer.selectedId : false}
                previewVersion={selectedPreview ? previews.versionOf(String(selectedPreview.id)) : 0}
                onSelect={() => selectedPreview && shop.select(selectedPreview)}
                onDownload={() => selectedPreview && shop.download(selectedPreview)}
                onClose={shop.closePreview}
            />
            <TemplateFormDialog
                open={form.open}
                editing={form.editing}
                isSuperUser={shop.viewer.isSuperUser}
                isSaving={form.isSaving}
                onSubmit={form.submit}
                onClose={form.close}
            />
        </Screen>
    );
};
