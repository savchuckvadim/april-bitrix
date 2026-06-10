'use client';

import React from 'react';
import { useAppSelector } from '@/modules/app';
import { useWordTemplate } from '../hooks/useWordTemplate';
import { WordTemplateVisibility } from '../types/word-template-types';
import { ACard } from '@workspace/ui/shared';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Download, Settings2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { getVisibilityBadgeClassName, getVisibilityBadgeVariant } from './ui-utils/get-by-visibility';

interface WordTemplateMenuProps {
    isWord: boolean;
}

export const WordTemplateMenu: React.FC<WordTemplateMenuProps> = ({ isWord }) => {
    const { selectedTemplate } = useAppSelector((state) => state.offerTemplateWord);
    const { openSettings, download } = useWordTemplate();

    if (!isWord) {
        return null;
    }

    const handleOpenSettings = () => {
        openSettings();
    };

    const handleDownload = async () => {
        if (selectedTemplate) {
            try {
                await download(selectedTemplate.id.toString(), selectedTemplate.name);
            } catch (error) {
                console.error('Failed to download template:', error);
                alert('Ошибка при скачивании шаблона');
            }
        }
    };

    const getVisibilityLabel = (visibility: string) => {
        switch (visibility) {
            case WordTemplateVisibility.PUBLIC:
            case 'public':
                return 'Публичный';
            case WordTemplateVisibility.PORTAL:
            case 'private':
                return 'Портал';
            case WordTemplateVisibility.USER:
            case 'user':
                return 'Пользователь';
            default:
                return visibility;
        }
    };

    return (
        <ACard
            padding="md"
            variant="outlined"
            className="border-border/80 shadow-sm"
            contentClassName="p-0"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span className="text-base" aria-hidden>
                            ℹ
                        </span>
                        <span>Текущий шаблон</span>
                    </div>

                    {selectedTemplate ? (
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="truncate text-base font-semibold text-foreground">
                                    {selectedTemplate.name}
                                </span>
                                <Badge
                                    variant={getVisibilityBadgeVariant(selectedTemplate.visibility)}
                                    className={cn('shrink-0', getVisibilityBadgeClassName(selectedTemplate.visibility))}
                                >
                                    {getVisibilityLabel(selectedTemplate.visibility)}
                                </Badge>
                                {selectedTemplate.is_default && (
                                    <Badge variant="default" className="shrink-0">
                                        По умолчанию
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Шаблон не выбран</p>
                    )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    {selectedTemplate && (
                        <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
                            <Download className="size-4" />
                            Скачать
                        </Button>
                    )}
                    <Button type="button" size="sm" onClick={handleOpenSettings}>
                        <Settings2 className="size-4" />
                        Настроить
                    </Button>
                </div>
            </div>
        </ACard>
    );
};
