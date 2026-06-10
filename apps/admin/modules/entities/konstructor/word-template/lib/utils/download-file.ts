export function downloadBlobFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Keep URL alive briefly so browser can finish reading.
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function downloadFromResponse(response: unknown, filename: string) {
    if (response instanceof Blob) {
        downloadBlobFile(response, filename);
        return;
    }

    if (typeof response === 'string') {
        window.open(response, '_blank');
    }
}
