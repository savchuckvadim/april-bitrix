/** Имя файла для скачивания: название шаблона плюс `.docx`, без символов, запрещённых в именах. */
export const templateFileName = (name: string): string => {
    const base = name.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'invoice-template';
    return base.toLowerCase().endsWith('.docx') ? base : `${base}.docx`;
};

/**
 * Отдаёт blob браузеру как файл. Пустой ответ и не blob (ошибка бэка в теле)
 * считаются неудачей: пользователь иначе получил бы пустой файл.
 */
export const saveBlobAsFile = (blob: Blob, fileName: string): void => {
    if (!(blob instanceof Blob)) {
        throw new Error('Ответ сервера не файл');
    }
    if (blob.size === 0) {
        throw new Error('Файл шаблона пуст');
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    // браузеру нужен тик, чтобы начать скачивание
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
};
