import { fetchWordTemplatePreview } from './api/template-preview.api';

export type TemplatePreviewKind = 'pdf' | 'image';

export interface TemplatePreviewFile {
    kind: TemplatePreviewKind;
    /** object URL — живёт до смены превью этого шаблона */
    url: string;
}

/**
 * Превью шаблонов на время вкладки: сетка магазина перерисовывается и
 * монтирует карточки заново — повторно в бэк не ходим. После замены файла
 * или своей картинки превью сбрасывается (`invalidateTemplatePreview`).
 */
const cache = new Map<string, Promise<TemplatePreviewFile>>();

const load = async (id: string): Promise<TemplatePreviewFile> => {
    const blob = await fetchWordTemplatePreview(id);
    return {
        kind: blob.type.startsWith('image/') ? 'image' : 'pdf',
        url: URL.createObjectURL(blob),
    };
};

export const getTemplatePreview = (id: string): Promise<TemplatePreviewFile> => {
    let entry = cache.get(id);
    if (!entry) {
        entry = load(id);
        // неудача не кэшируется: следующий показ попробует снова
        entry.catch(() => cache.delete(id));
        cache.set(id, entry);
    }
    return entry;
};

export const invalidateTemplatePreview = (id: string): void => {
    const entry = cache.get(id);
    cache.delete(id);
    void entry?.then(file => URL.revokeObjectURL(file.url)).catch(() => undefined);
};
