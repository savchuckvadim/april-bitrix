'use client';

import { Document, Page } from 'react-pdf';
import '@/modules/shared/lib/pdf-worker';
import type { TemplatePreviewFile } from '../../../lib/template-preview-cache';

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
