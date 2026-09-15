'use client';

import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Системное «меньше движения». До гидратации — false (на сервере matchMedia
 * нет), поэтому анимированные компоненты обязаны переживать первый рендер
 * в обычном виде без скачка вёрстки.
 */
export const useReducedMotion = (): boolean => {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const query = window.matchMedia(QUERY);
        const read = () => setReduced(query.matches);
        read();
        query.addEventListener('change', read);
        return () => query.removeEventListener('change', read);
    }, []);

    return reduced;
};
