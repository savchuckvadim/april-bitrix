import { customAxios } from '@workspace/nest-konstructor-api';

/**
 * Превью Word-шаблона для магазина шаблонов. Ручки появились 13.11 и в
 * orval ещё не попали — тот же транспорт customAxios (CLAUDE.md, раздел
 * model); после `pnpm run generate` заменить на сгенерированный клиент.
 */
const previewUrl = (id: string) => `/api/word-templates/${id}/preview`;

/** PDF первой страницы (собран на образце «Гарант-Офис») или своя картинка. */
export const fetchWordTemplatePreview = (id: string): Promise<Blob> =>
    customAxios<Blob>({ url: previewUrl(id), method: 'GET', responseType: 'blob' });

/** Своя картинка превью (PNG, JPEG, WebP) — заменяет сгенерированное. */
export const uploadWordTemplatePreview = (id: string, file: File): Promise<boolean> => {
    const form = new FormData();
    form.append('file', file);
    return customAxios<boolean>({
        url: previewUrl(id),
        method: 'PUT',
        data: form,
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

/** Убрать свою картинку — вернётся сгенерированное превью. */
export const removeWordTemplatePreview = (id: string): Promise<boolean> =>
    customAxios<boolean>({ url: previewUrl(id), method: 'DELETE' });
