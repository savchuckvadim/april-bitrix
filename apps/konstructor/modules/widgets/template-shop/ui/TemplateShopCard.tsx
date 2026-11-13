'use client';

import { Check, Star } from 'lucide-react';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import type { WordTemplateSummary } from '@/modules/entities/offer-template-word';
import { visibilityLabel } from '../lib/template-shop.util';
import { TemplateCardMenu } from './TemplateCardMenu';
import { TemplateCardPreview } from './TemplateCardPreview';

export interface TemplateShopCardProps {
    template: WordTemplateSummary;
    selected: boolean;
    favorite: boolean;
    canManage: boolean;
    canManagePreview: boolean;
    previewVersion: number;
    onSelect: () => void;
    onOpenPreview: () => void;
    onToggleFavorite: () => void;
    onDownload: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onUploadPreview: (file: File) => void;
    onResetPreview: () => void;
}

/**
 * Карточка витрины: превью первой страницы (клик — крупно), название,
 * видимость, избранное, «Выбрать». Выбранный — кольцом с отступом: соседние
 * рамки не наезжают друг на друга.
 */
export const TemplateShopCard = ({
    template,
    selected,
    favorite,
    canManage,
    canManagePreview,
    previewVersion,
    onSelect,
    onOpenPreview,
    onToggleFavorite,
    onDownload,
    onEdit,
    onDelete,
    onUploadPreview,
    onResetPreview,
}: TemplateShopCardProps) => (
    <article
        className={cn(
            'flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md',
            selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        )}
    >
        <button
            type="button"
            onClick={onOpenPreview}
            className="relative cursor-zoom-in border-b"
            aria-label={`Превью шаблона «${template.name}»`}
        >
            <TemplateCardPreview templateId={String(template.id)} version={previewVersion} />
            {selected ? (
                <span className="absolute top-2 left-2">
                    <ToneBadge tone="primary" variant="solid">
                        Выбран
                    </ToneBadge>
                </span>
            ) : null}
        </button>
        <div className="flex flex-1 flex-col gap-2 p-3">
            <div className="flex items-start gap-2">
                <h3 className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold text-foreground">{template.name}</h3>
                <button
                    type="button"
                    onClick={onToggleFavorite}
                    aria-pressed={favorite}
                    aria-label={favorite ? 'Убрать из избранного' : 'В избранное'}
                    className="cursor-pointer rounded p-0.5 text-muted-foreground hover:text-warning"
                >
                    <Star className={cn('size-4', favorite && 'fill-warning text-warning')} aria-hidden />
                </button>
            </div>
            <div className="flex flex-wrap gap-1">
                <ToneBadge tone="muted" variant="soft">
                    {visibilityLabel(template)}
                </ToneBadge>
                {template.is_default ? (
                    <ToneBadge tone="info" variant="soft">
                        По умолчанию
                    </ToneBadge>
                ) : null}
            </div>
            <div className="mt-auto flex items-center gap-2 pt-1">
                <Button
                    size="sm"
                    className="flex-1"
                    variant={selected ? 'secondary' : 'default'}
                    disabled={selected}
                    onClick={onSelect}
                >
                    {selected ? <Check aria-hidden /> : null}
                    {selected ? 'Выбран' : 'Выбрать'}
                </Button>
                <TemplateCardMenu
                    canManage={canManage}
                    canManagePreview={canManagePreview}
                    onDownload={onDownload}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onUploadPreview={onUploadPreview}
                    onResetPreview={onResetPreview}
                />
            </div>
        </div>
    </article>
);
