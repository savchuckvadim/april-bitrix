'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/**
 * react-pdf трогает DOM (DOMMatrix) уже при импорте, поэтому панель превью
 * грузится только в браузере: SSR экрана КП иначе падает на 500.
 */
export const WordTemplatePdfPreviewPanelLoadable = dynamic(
    () => import('./WordTemplatePdfPreviewPanel').then(m => m.WordTemplatePdfPreviewPanel),
    {
        ssr: false,
        loading: () => (
            <div className="flex min-h-[200px] items-center justify-center py-10">
                <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
                <span className="sr-only">Загрузка превью…</span>
            </div>
        ),
    },
);
