'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAppSelector } from '@/modules/app';
import {
    invalidateTemplatePreview,
    useWordTemplate,
    type CreateWordTemplateRequest,
    type CreateWordTemplateThunkDto,
    type UpdateWordTemplateRequest,
    type WordTemplateSummary,
} from '@/modules/entities/offer-template-word';
import { toUpdatePayload } from '../lib/template-form.util';

/**
 * Окно загрузки и правки шаблона: создание — в очереди сущности, правка —
 * с привязкой по видимости; новый файл сбрасывает превью карточки.
 */
export const useTemplateForm = (onPreviewChanged: (id: string) => void) => {
    const word = useWordTemplate();
    const portalId = useAppSelector(state => state.portal.current?.id);
    const userId = useAppSelector(state => Number(state.app.bitrix.user?.ID) || 0);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<WordTemplateSummary | null>(null);

    const close = () => {
        setOpen(false);
        setEditing(null);
    };

    return {
        open,
        editing,
        isSaving: word.isCreating || word.isUpdating,
        openCreate: () => {
            setEditing(null);
            setOpen(true);
        },
        openEdit: (template: WordTemplateSummary) => {
            setEditing(template);
            setOpen(true);
        },
        close,
        submit: async (data: CreateWordTemplateRequest | UpdateWordTemplateRequest) => {
            if (!editing) {
                word.create(data as CreateWordTemplateThunkDto);
                close();
                return;
            }
            try {
                const id = String(editing.id);
                await word.update(id, toUpdatePayload(data as UpdateWordTemplateRequest, editing, { portalId, userId }));
                if (data.file) {
                    invalidateTemplatePreview(id);
                    onPreviewChanged(id);
                }
                close();
            } catch {
                toast.error('Не удалось сохранить шаблон');
            }
        },
    };
};
