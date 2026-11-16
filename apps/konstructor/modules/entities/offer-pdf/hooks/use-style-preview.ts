'use client';

import { useEffect, useState } from 'react';
import { getStylePreview } from '../lib/style-preview-cache';

export type StylePreviewState = { status: 'loading' } | { status: 'ready'; url: string } | { status: 'error' };

/**
 * Миниатюра стиля: грузится, только когда карточка видна (`visible`), —
 * десяток стилей не собирает превью разом.
 */
export const useStylePreview = (code: string, palette: string | null, visible: boolean): StylePreviewState => {
    const [state, setState] = useState<StylePreviewState>({ status: 'loading' });

    useEffect(() => {
        if (!visible) return;
        let alive = true;
        setState({ status: 'loading' });
        getStylePreview(code, palette)
            .then(url => alive && setState({ status: 'ready', url }))
            .catch(() => alive && setState({ status: 'error' }));
        return () => {
            alive = false;
        };
    }, [code, palette, visible]);

    return state;
};
