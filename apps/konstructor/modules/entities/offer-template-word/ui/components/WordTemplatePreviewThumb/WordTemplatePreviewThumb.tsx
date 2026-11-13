'use client';

import { Document, Page, pdfjs } from 'react-pdf';
import type { TemplatePreviewFile } from '../../../lib/template-preview-cache';

if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
}

export interface WordTemplatePreviewThumbProps {
    file: TemplatePreviewFile;
    /** Ширина страницы в px: карточка — узкая, окно просмотра — широкая */
    width: number;
}

/**
 * Первая страница шаблона: PDF (собран на образце) — через react-pdf, своя
 * картинка — как есть. react-pdf трогает DOM при импорте: подключать через
 * `WordTemplatePreviewThumbLoadable` (next/dynamic, ssr: false).
 */
export const WordTemplatePreviewThumb = ({ file, width }: WordTemplatePreviewThumbProps) =>
    file.kind === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element -- object URL, next/image его не оптимизирует
        <img src={file.url} alt="" style={{ width }} className="h-auto" />
    ) : (
        <Document file={file.url} loading={null} error={null}>
            <Page pageNumber={1} width={width} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
    );
