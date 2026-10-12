/**
 * Сохранение скачанного файла шаблона.
 *
 * Повторяет поведение word-template: бэк отдаёт либо blob, либо строку-URL,
 * и оба случая должны привести к сохранению файла, а не к пустому клику.
 */
export function downloadBlobFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // URL держим живым, пока браузер дочитывает файл.
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function downloadInvoiceTemplateFile(
    response: unknown,
    filename: string,
): void {
    if (response instanceof Blob) {
        downloadBlobFile(response, filename);
        return;
    }

    if (typeof response === 'string' && response) {
        window.open(response, '_blank');
    }
}
