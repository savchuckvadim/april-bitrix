import type { AiOwnerReportKind } from '@/modules/entities/ai-analytics';

/** Имя файла PDF: латиницей, по виду и ключу периода (как у бэка). */
export const aiOwnerReportPdfFilename = (
    kind: AiOwnerReportKind,
    periodKey: string,
): string => `sales-report-${kind}-${periodKey}.pdf`;

/**
 * Сохранить blob как файл через временную ссылку. В браузере без DOM
 * (тесты, SSR) ничего не делает.
 */
export const saveBlobAsFile = (blob: Blob, filename: string): void => {
    if (typeof document === 'undefined' || typeof URL === 'undefined') return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
