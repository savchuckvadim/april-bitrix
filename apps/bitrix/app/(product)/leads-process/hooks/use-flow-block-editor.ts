'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadFlowVariant } from '../lib/flow-variant-storage';

/**
 * Видимость редактора «своего варианта» под оригиналом схемы:
 * сохранённый в браузере вариант открывается автоматически.
 */
export const useFlowBlockEditor = (flowId: string) => {
    const [isEditorOpen, setEditorOpen] = useState(false);

    useEffect(() => {
        if (loadFlowVariant(flowId)) setEditorOpen(true);
    }, [flowId]);

    const openEditor = useCallback(() => setEditorOpen(true), []);
    const closeEditor = useCallback(() => setEditorOpen(false), []);

    return { isEditorOpen, openEditor, closeEditor };
};
