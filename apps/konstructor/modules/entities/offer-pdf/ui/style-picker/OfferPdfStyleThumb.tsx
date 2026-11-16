'use client';

import { Document, Page } from 'react-pdf';
import '@/modules/shared/lib/pdf-worker';

export interface OfferPdfStyleThumbProps {
    /** object URL PDF первой страницы стиля */
    url: string;
    width: number;
}

/**
 * Первая страница стиля через react-pdf. react-pdf трогает DOM при импорте —
 * подключать через `OfferPdfStyleThumbLoadable` (next/dynamic, ssr: false).
 */
export const OfferPdfStyleThumb = ({ url, width }: OfferPdfStyleThumbProps) => (
    <Document file={url} loading={null} error={null}>
        <Page pageNumber={1} width={width} renderTextLayer={false} renderAnnotationLayer={false} />
    </Document>
);
