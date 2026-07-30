'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Полноэкранный режим канваса: состояние, Esc для выхода,
 * блокировка прокрутки страницы под оверлеем.
 */
export const useFlowFullscreen = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const open = useCallback(() => setIsFullscreen(true), []);
    const close = useCallback(() => setIsFullscreen(false), []);
    const toggle = useCallback(() => setIsFullscreen((value) => !value), []);

    useEffect(() => {
        if (!isFullscreen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsFullscreen(false);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isFullscreen]);

    return { isFullscreen, open, close, toggle };
};
