'use client';

import React from 'react';
import { PdfPreviewViewer } from '@/modules/shared/ui/PdfPreview/PdfPreviewViewer';
import { useOfferPdfDocument } from '../model/OfferPdfDocumentContext';

/** Превью КП в PDF: собирается бэком целиком, без очереди. */
export const OfferPdfPreviewPanel: React.FC = () => {
    const { preview, refreshPreview, blocker } = useOfferPdfDocument();

    return (
        <PdfPreviewViewer
            pdfObjectUrl={preview.objectUrl}
            busy={preview.phase === 'loading'}
            busyLabel="Собираем PDF…"
            error={preview.error}
            stale={preview.stale}
            onRefresh={refreshPreview}
            emptyHint={blocker ?? 'Превью появится, как только заполните данные документа.'}
            extra={
                preview.durationMs != null ? (
                    <p className="text-xs text-muted-foreground">Собрано за {preview.durationMs} мс</p>
                ) : null
            }
        />
    );
};
