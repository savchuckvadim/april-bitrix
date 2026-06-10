'use client';

import React from 'react';
import { WordTemplateSummary, WordTemplateVisibility } from '../../../types/word-template-types';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { Download, Edit2, Star, Trash2, Check } from 'lucide-react';
import { useWordTemplate } from '../../../hooks/useWordTemplate';
import { getVisibilityBadgeClassName, getVisibilityBadgeVariant, getVisibilityIcon } from '../../ui-utils/get-by-visibility';
import { cn } from '@workspace/ui/lib/utils';

interface WordTemplateCardProps {
    template: WordTemplateSummary;
    isSelected: boolean;
    isFavorite: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onDownload: () => void;
}

const NAME_VISUAL_LIMIT = 25;

export const WordTemplateCard: React.FC<WordTemplateCardProps> = ({
    template,
    isSelected,
    isFavorite,
    canEdit,
    canDelete,
    onSelect,
    onEdit,
    onDelete,
    onDownload,
}) => {
    const { isDeleting, getIsOwnTemplate, toggleFavorite } = useWordTemplate();

    const isCurrentDeleting = isDeleting && isDeleting === template.id;
    const isOwnTemplate = getIsOwnTemplate(template);

    const getName = (name: string) => {
        if (name.length > NAME_VISUAL_LIMIT) {
            return name.substring(0, NAME_VISUAL_LIMIT) + '…';
        }
        return name;
    };

    return (
        <div
            className={cn(
                'word-template-card flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow',
                isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                !template.is_active && 'opacity-75',
                isCurrentDeleting && 'pointer-events-none opacity-50',
            )}
        >
            <div className="word-template-card__header flex items-start justify-between gap-2">
                <div className="word-template-card__title-section min-w-0 flex-1 space-y-2">
                    <div className="flex flex-row flex-wrap items-center gap-2">
                        <Badge
                            variant={getVisibilityBadgeVariant(template.visibility)}
                            className={cn('shrink-0 gap-1', getVisibilityBadgeClassName(template.visibility))}
                        >
                            <span className="inline-flex items-center">{getVisibilityIcon(template.visibility)}</span>
                        </Badge>
                        <h4 className="word-template-card__name truncate text-sm font-semibold text-foreground">
                            {getName(template.name)}
                        </h4>
                        {!template.is_active && (
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                                Неактивен
                            </Badge>
                        )}
                    </div>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant={isFavorite ? 'default' : 'ghost'}
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={() => toggleFavorite(template.id.toString())}
                            aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
                        >
                            <Star className={cn('size-4', isFavorite && 'fill-current')} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        {isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    </TooltipContent>
                </Tooltip>
            </div>

            <div className="word-template-card__body mt-3 min-h-0 flex-1">
                {template.tags && (
                    <p className="word-template-card__tags line-clamp-2 text-xs text-muted-foreground">{template.tags}</p>
                )}
            </div>

            {!isCurrentDeleting && (
                <div className="word-template-card__footer mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="word-template-card__status">
                        {isSelected ? (
                            <Badge variant="default" className="gap-1">
                                <Check className="size-3" />
                                Выбран
                            </Badge>
                        ) : (
                            <Badge variant="secondary">Не выбран</Badge>
                        )}
                    </div>
                    <div className="word-template-card__buttons flex flex-wrap items-center justify-end gap-1">
                        {!isSelected && (
                            <Button type="button" size="sm" onClick={onSelect}>
                                Выбрать
                            </Button>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button type="button" variant="outline" size="icon" className="size-8" onClick={onDownload}>
                                    <Download className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Скачать шаблон</TooltipContent>
                        </Tooltip>
                        {canEdit && isOwnTemplate && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" className="size-8" onClick={onEdit}>
                                        <Edit2 className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Редактировать</TooltipContent>
                            </Tooltip>
                        )}
                        {canDelete && isOwnTemplate && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="size-8"
                                        onClick={onDelete}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Удалить</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
