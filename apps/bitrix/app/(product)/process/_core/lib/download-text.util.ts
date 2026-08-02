/**
 * Скачивание текстового файла (регламент) — только на клиенте.
 *
 * Раздел намеренно самодостаточен и ничего не берёт из старых страниц
 * (`how-we-work`, `leads-process`): они могут быть удалены.
 */
export const downloadText = (fileName: string, text: string): void => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
};
