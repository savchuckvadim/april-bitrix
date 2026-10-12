/**
 * Скачивание файла шаблона из Blob`а.
 *
 * Копия подхода word-template (`lib/utils/download-file.ts`): объектный URL
 * отзывается с задержкой — браузер успевает дочитать поток до revoke.
 */
export function downloadBlobFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/** Имя файла для скачивания: «название шаблона.docx», с запасным вариантом. */
export function supplyReportTemplateFileName(
    item: { id: string; name?: string | null },
    kind: 'template' | 'demo' = 'template',
): string {
    const base = (item.name ?? '').trim() || `supply-report-template-${item.id}`;
    const suffix = kind === 'demo' ? '-demo' : '';
    return `${base}${suffix}.docx`;
}
