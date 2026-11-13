'use client';

import { useState } from 'react';
import { useWordTemplatePdfPreview } from '@/modules/entities/offer-template-word';

export type OfferDocumentTab = 'setup' | 'preview';

/**
 * Вкладки экрана КП: «Настройка» и «Превью». Открыли «Превью» по
 * Word-шаблону, а его ещё нет или он устарел после правок — собираем сразу,
 * без отдельной кнопки. PDF из встроенного шаблона пересобирается сам.
 */
export const useOfferDocumentTabs = (isPdf: boolean) => {
    const [tab, setTab] = useState<OfferDocumentTab>('setup');
    const preview = useWordTemplatePdfPreview();
    const busy = preview.previewPhase === 'starting' || preview.previewPhase === 'polling';
    const stale = !isPdf && (preview.needUpdate || !preview.previewPdfObjectUrl);

    return {
        tab,
        /** Превью Word ещё не собрано или устарело — метка на вкладке */
        previewStale: stale && !busy,
        select: (next: string) => {
            const value: OfferDocumentTab = next === 'preview' ? 'preview' : 'setup';
            setTab(value);
            if (value === 'preview' && stale && !busy) preview.refreshPdfPreview();
        },
    };
};
