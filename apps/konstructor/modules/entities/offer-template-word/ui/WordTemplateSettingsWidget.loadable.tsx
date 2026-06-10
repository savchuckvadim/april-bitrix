'use client';

import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const WordTemplateSettingsWidgetLazy = React.lazy(() =>
    import('./WordTemplateSettingsWidget').then((m) => ({
        default: m.WordTemplateSettingsWidget,
    })),
);

export const WordTemplateSettingsWidgetLoadable: React.FC = () => (
    <Suspense
        fallback={
            <div className="flex min-h-[200px] items-center justify-center py-10">
                <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
                <span className="sr-only">Загрузка…</span>
            </div>
        }
    >
        <WordTemplateSettingsWidgetLazy />
    </Suspense>
);
