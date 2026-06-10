'use client';

import React from 'react';
import { WordTemplateSummary } from '../../../types/word-template-types';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Download } from 'lucide-react';
import { Tags } from './components/TagsList';
import {
    getVisibilityBadgeClassName,
    getVisibilityBadgeVariant,
    getVisibilityIcon,
    getVisibilityLabel,
} from '../../ui-utils/get-by-visibility';
import { cn } from '@workspace/ui/lib/utils';

interface WordTemplateCurrentInfoProps {
    template: WordTemplateSummary | null;
    onDownload: () => void;
}

export const WordTemplateCurrentInfo: React.FC<WordTemplateCurrentInfoProps> = ({ template, onDownload }) => {
    if (!template) {
        return (
            <Card className="border-dashed bg-muted/20">
                <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                    <span className="text-2xl text-muted-foreground" aria-hidden>
                        ℹ
                    </span>
                    <p className="text-sm font-medium text-foreground">Шаблон не выбран</p>
                    <span className="text-xs text-muted-foreground">Выберите шаблон из списка ниже</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <Badge
                        variant={getVisibilityBadgeVariant(template.visibility)}
                        className={cn('gap-1', getVisibilityBadgeClassName(template.visibility))}
                    >
                        <span className="inline-flex items-center">{getVisibilityIcon(template.visibility)}</span>
                    </Badge>
                    <h3 className="truncate text-lg font-semibold tracking-tight">Шаблон {template.name}</h3>
                </div>
                <Button type="button" size="sm" className="shrink-0 gap-2" onClick={onDownload}>
                    <Download className="size-4" />
                    Скачать
                </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        {getVisibilityLabel(template.visibility)}
                    </Badge>
                    {!template.is_active && (
                        <Badge variant="secondary" className="text-xs">
                            Неактивен
                        </Badge>
                    )}
                </div>
                {template.tags && <Tags tags={template.tags} />}
            </CardContent>
        </Card>
    );
};
