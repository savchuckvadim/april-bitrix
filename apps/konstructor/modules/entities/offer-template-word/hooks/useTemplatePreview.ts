'use client';

import { useEffect, useState } from 'react';
import { getTemplatePreview, type TemplatePreviewFile } from '../lib/template-preview-cache';

export type TemplatePreviewState =
    | { status: 'loading' }
    | { status: 'ready'; file: TemplatePreviewFile }
    | { status: 'error' };

/**
 * Превью шаблона для карточки магазина. Грузится, только когда карточка
 * видна (`visible`), — сетка из десятков шаблонов не собирает все превью
 * разом. `version` сбрасывает показанное после замены файла или картинки.
 */
export const useTemplatePreview = (id: string, visible: boolean, version = 0): TemplatePreviewState => {
    const [state, setState] = useState<TemplatePreviewState>({ status: 'loading' });

    useEffect(() => {
        if (!visible) return;
        let alive = true;
        setState({ status: 'loading' });
        getTemplatePreview(id)
            .then(file => alive && setState({ status: 'ready', file }))
            .catch(() => alive && setState({ status: 'error' }));
        return () => {
            alive = false;
        };
    }, [id, visible, version]);

    return state;
};
