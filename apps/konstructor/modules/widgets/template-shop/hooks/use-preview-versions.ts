'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    invalidateTemplatePreview,
    removeWordTemplatePreview,
    uploadWordTemplatePreview,
    type WordTemplateSummary,
} from '@/modules/entities/offer-template-word';

/**
 * Своё превью шаблона (картинка вместо собранного PDF) и счётчик версий:
 * после загрузки, удаления картинки или замены файла карточка перезапрашивает
 * превью.
 */
export const usePreviewVersions = () => {
    const [versions, setVersions] = useState<Record<string, number>>({});

    const bump = (id: string) => {
        invalidateTemplatePreview(id);
        setVersions(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    };

    return {
        versionOf: (id: string) => versions[id] ?? 0,
        bump,
        upload: async (template: WordTemplateSummary, file: File) => {
            try {
                await uploadWordTemplatePreview(String(template.id), file);
                bump(String(template.id));
                toast.success('Своё превью загружено');
            } catch {
                toast.error('Превью — картинка PNG, JPEG или WebP до 3 МБ');
            }
        },
        reset: async (template: WordTemplateSummary) => {
            try {
                await removeWordTemplatePreview(String(template.id));
                bump(String(template.id));
                toast.success('Превью снова собирается по шаблону');
            } catch {
                toast.error('Не удалось убрать своё превью');
            }
        },
    };
};
