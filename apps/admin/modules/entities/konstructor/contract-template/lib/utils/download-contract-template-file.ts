/**
 * Сохранение blob в файл. Копия приёма из word-template: отдельный модуль,
 * потому что download-ручка возвращает поток, а не ссылку.
 */
export function downloadBlobFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Ссылка живёт ещё немного, чтобы браузер успел дочитать поток.
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function downloadFromResponse(response: unknown, filename: string): void {
    if (response instanceof Blob) {
        downloadBlobFile(response, filename);
        return;
    }

    if (typeof response === 'string') {
        window.open(response, '_blank');
    }
}
