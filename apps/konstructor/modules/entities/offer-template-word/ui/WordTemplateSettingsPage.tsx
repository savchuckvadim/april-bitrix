'use client';

import { useWordTemplatePage } from '../hooks/useWordTemplatePage';
import { WordTemplateSettingsWidgetLoadable } from './WordTemplateSettingsWidget.loadable';
import { Loader2 } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

export const WordTemplateSettingsPage: React.FC = () => {
    const { isSettingsOpen, isInitialized, isLoading } = useWordTemplatePage();

    if (!isInitialized || isLoading) {
        return (
            <div
                className={cn(
                    'flex min-h-screen flex-col items-center justify-center',
                    'bg-background text-foreground',
                )}
            >
                <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
                <p className="mt-4 text-sm text-muted-foreground">Загрузка шаблонов…</p>
            </div>
        );
    }

    if (!isSettingsOpen || !isInitialized) {
        return null;
    }

    return (
        <div
            className={cn(
                'rounded-2xl border border-border bg-card p-4 shadow-sm',
                'word-template-settings-page-root',
            )}
        >
            <WordTemplateSettingsWidgetLoadable />
        </div>
    );
};
