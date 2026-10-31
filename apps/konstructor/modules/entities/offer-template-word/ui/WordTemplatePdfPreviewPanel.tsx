'use client';

import React from 'react';
import { PdfPreviewViewer } from '@/modules/shared/ui/PdfPreview/PdfPreviewViewer';
import { useWordTemplatePdfPreview } from '../hooks/useWordTemplatePdfPreview';

/** Превью PDF по Word-шаблону: состояние — из очереди ephemeral-pdf, просмотр — общий PdfPreviewViewer. */
export const WordTemplatePdfPreviewPanel: React.FC = () => {
    const {
        previewPhase: phase,
        previewPdfObjectUrl: pdfObjectUrl,
        previewError: error,
        needUpdate,
        refreshPdfPreview,
    } = useWordTemplatePdfPreview();

    const busy = phase === 'starting' || phase === 'polling';

    return (
        <PdfPreviewViewer
            pdfObjectUrl={pdfObjectUrl}
            busy={busy}
            busyLabel={phase === 'starting' ? 'Запуск генерации PDF…' : 'Ожидание PDF в очереди…'}
            error={error}
            stale={needUpdate}
            onRefresh={refreshPdfPreview}
            emptyHint="Нажмите «Обновить превью», когда выбран шаблон и заполнены данные документа."
        />
    );
};
